import abi from './abi';
import type { Address } from 'viem';
import type { BlockchainClients } from '../../core/client-factory';
import {
  PreCheckError,
  type WithdrawResult,
  type AttemptWithdrawParams,
  type PreCheckResult,
  type MarketState,
  type Position,
} from './types';

/**
 * Helper function to convert shares to assets
 */
function convertSharesToAssets(
  shares: bigint,
  totalAssets: bigint,
  totalShares: bigint
): bigint {
  if (totalShares === 0n) return 0n;
  return (shares * totalAssets) / totalShares;
}

/**
 * Helper function to convert market array response to MarketState object
 */
function arrayToMarket(arr: readonly bigint[]): MarketState {
  return {
    totalSupplyAssets: arr[0],
    totalSupplyShares: arr[1],
    totalBorrowAssets: arr[2],
    totalBorrowShares: arr[3],
    lastUpdate: arr[4],
    fee: arr[5],
  };
}

/**
 * Helper function to convert position array response to Position object
 */
function arrayToPosition(arr: readonly bigint[]): Position {
  return {
    supplyShares: arr[0],
    borrowShares: arr[1] as bigint,
    collateral: arr[2] as bigint,
  };
}

/**
 * Performs pre-execution checks before starting the withdraw loop
 * - Bot has sufficient ETH for gas
 * - Owner has authorized bot to manage their positions
 */
export async function preExecutionCheck(
  clients: BlockchainClients,
  params: AttemptWithdrawParams
): Promise<PreCheckResult> {
  const { morphoAddress, marketId, owner } = params;
  const { publicClient, account } = clients;
  const botAddress = account.address;

  try {
    // Check bot has ETH for gas
    const botBalance = await publicClient.getBalance({ address: botAddress });
    if (botBalance === 0n) {
      return { isValid: false, error: PreCheckError.NoEth };
    }

    // Check if bot is authorized by owner to manage positions
    const isAuthorized = (await publicClient.readContract({
      address: morphoAddress,
      abi: abi,
      functionName: 'isAuthorized',
      args: [owner, botAddress],
    })) as boolean;

    if (!isAuthorized) {
      return { isValid: false, error: PreCheckError.NotAuthorized };
    }

    return { isValid: true };
  } catch {
    return { isValid: false };
  }
}

/**
 * Attempts to withdraw all available supply from a Morpho market
 */
export async function attemptWithdraw(
  clients: BlockchainClients,
  params: AttemptWithdrawParams
): Promise<WithdrawResult> {
  const { morphoAddress, marketId, owner } = params;
  const { publicClient, walletClient } = clients;

  try {
    // Fetch position and market state
    const [positionArray, marketArray] = await Promise.all([
      publicClient.readContract({
        address: morphoAddress,
        abi: abi,
        functionName: 'position',
        args: [marketId, owner],
      }) as Promise<readonly bigint[]>,
      publicClient.readContract({
        address: morphoAddress,
        abi: abi,
        functionName: 'market',
        args: [marketId],
      }) as Promise<readonly bigint[]>,
    ]);

    const position = arrayToPosition(positionArray);
    const market = arrayToMarket(marketArray);

    // If no supply shares, nothing to withdraw
    if (position.supplyShares === 0n) {
      return {
        success: false,
        sharesToWithdraw: 0n,
        assetsToWithdraw: 0n,
        currentSupplyShares: 0n,
        currentSupplyAssets: 0n,
        availableLiquidity: 0n,
      };
    }

    // Convert shares to assets
    const supplyAssets = convertSharesToAssets(
      position.supplyShares,
      market.totalSupplyAssets,
      market.totalSupplyShares
    );

    // Calculate available liquidity (total supply - total borrow)
    const availableLiquidity = market.totalSupplyAssets - market.totalBorrowAssets;

    console.log("available", availableLiquidity)

    // Determine what we can withdraw
    let sharesToWithdraw = 0n;
    let assetsToWithdraw = 0n;

    if (availableLiquidity > 0n) {
      if (availableLiquidity > supplyAssets) {
        // Enough liquidity to withdraw everything - use shares for max amount
        sharesToWithdraw = position.supplyShares;
      } else {
        // Partial withdrawal - use exact assets amount
        assetsToWithdraw = availableLiquidity;
      }

      // Need to get marketParams to call withdraw
      const marketParams = (await publicClient.readContract({
        address: morphoAddress,
        abi: abi,
        functionName: 'idToMarketParams',
        args: [marketId],
      })) as readonly [Address, Address, Address, Address, bigint];

      const marketParamsTuple = {
        loanToken: marketParams[0],
        collateralToken: marketParams[1],
        oracle: marketParams[2],
        irm: marketParams[3],
        lltv: marketParams[4],
      };


      // Execute withdrawal
      const hash = await walletClient.writeContract({
        address: morphoAddress,
        abi: abi,
        functionName: 'withdraw',
        args: [marketParamsTuple, assetsToWithdraw, sharesToWithdraw, owner, owner] as any,
      });

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        success: receipt.status === 'success',
        sharesToWithdraw,
        assetsToWithdraw,
        currentSupplyShares: position.supplyShares,
        currentSupplyAssets: supplyAssets,
        availableLiquidity,
        transactionHash: hash,
      };
    }

    // No liquidity available
    return {
      success: false,
      sharesToWithdraw: 0n,
      assetsToWithdraw: 0n,
      currentSupplyShares: position.supplyShares,
      currentSupplyAssets: supplyAssets,
      availableLiquidity: 0n,
    };
  } catch {
    return {
      success: false,
      sharesToWithdraw: 0n,
      assetsToWithdraw: 0n,
      currentSupplyShares: 0n,
      currentSupplyAssets: 0n,
      availableLiquidity: 0n,
    };
  }
}

export function getOperatorAddress(clients: BlockchainClients): Address {
  return clients.account.address;
}
