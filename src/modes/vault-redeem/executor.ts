import { abi } from './abi';
import { Address, parseEther } from 'viem';
import type { BlockchainClients } from '../../core/client-factory';
import type { RedeemResult, AttemptRedeemParams, PreCheckResult } from './types';

/**
 * Performs pre-execution checks before starting the redeem loop
 * - Always checks: Bot has sufficient ETH for gas
 * - Delegate mode only: Owner has approved bot to spend shares
 */
export async function preExecutionCheck(
  clients: BlockchainClients,
  params: AttemptRedeemParams
): Promise<PreCheckResult> {
  const { vault, owner, delegate = false } = params;
  const { publicClient, account } = clients;
  const botAddress = account.address;

  try {
    // Check bot has ETH for gas
    const botBalance = await publicClient.getBalance({ address: botAddress });
    
    if (botBalance === 0n) {
      return {
        isValid: false,
        error: `No ETH for gas.`,
      };
    }

    // In delegate mode, check if bot has allowance to spend owner's shares
    if (delegate) {
      const allowance = await publicClient.readContract({
        address: vault,
        abi: abi,
        functionName: 'allowance',
        args: [owner, botAddress],
      }) as bigint;

      if (allowance === 0n) {
        return {
          isValid: false,
          error: 'Bot has no allowance to spend owner shares. Owner must approve bot first.',
        };
      }
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error during pre-check',
    };
  }
}

export async function attemptRedeem(
  clients: BlockchainClients,
  params: AttemptRedeemParams
): Promise<RedeemResult> {
  const { vault, owner, delegate = false } = params;
  const { publicClient, walletClient, account } = clients;

  try {
    const botAddress = account.address;

    // In delegate mode: check owner's balance/allowance and redeem from owner
    // In non-delegate mode: check bot's balance and redeem from bot
    const shareHolder = delegate ? owner : botAddress;

    // Fetch balance and max redeemable for the share holder
    const results = await publicClient.multicall({
      contracts: [{
        address: vault,
        abi: abi,
        functionName: 'balanceOf',
        args: [shareHolder],
      }, {
        address: vault,
        abi: abi,
        functionName: 'maxRedeem',
        args: [shareHolder],
      }]
    });

    const balance = results[0].result as bigint;
    const maxRedeemable = results[1].result as bigint;

    // Take minimum of balance and maxRedeemable
    const sharesToRedeem = balance < maxRedeemable ? balance : maxRedeemable;

    if (sharesToRedeem > 0n) {
      // Call redeem function
      // redeem(shares, receiver, owner) - receiver gets assets, shares taken from owner
      const hash = await walletClient.writeContract({
        address: vault,
        abi: abi,
        functionName: 'redeem',
        args: [sharesToRedeem, owner, shareHolder],
      });

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        success: receipt.status === 'success',
        sharesToRedeem,
        transactionHash: hash,
      };
    }

    return {
      success: false,
      sharesToRedeem: 0n,
    };
  } catch (error) {
    return {
      success: false,
      sharesToRedeem: 0n,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function getOperatorAddress(clients: BlockchainClients): Address {
  return clients.account.address;
}
