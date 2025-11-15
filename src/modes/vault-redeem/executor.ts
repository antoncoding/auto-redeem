import { abi } from './abi';
import { Address } from 'viem';
import type { BlockchainClients } from '../../core/client-factory';
import type { RedeemResult, AttemptRedeemParams } from './types';

export async function attemptRedeem(
  clients: BlockchainClients,
  params: AttemptRedeemParams
): Promise<RedeemResult> {
  const { vault, owner, delegate = false } = params;
  const { publicClient, walletClient, account } = clients;

  try {
    const botAddress = account.address;

    // Read balance and maxRedeem in parallel
    const [balance, maxRedeemable] = await Promise.all([
      publicClient.readContract({
        address: vault,
        abi: abi,
        functionName: 'balanceOf',
        args: [botAddress],
      }) as Promise<bigint>,
      publicClient.readContract({
        address: vault,
        abi: abi,
        functionName: 'maxRedeem',
        args: [botAddress],
      }) as Promise<bigint>,
    ]);

    // Take minimum of balance and maxRedeemable
    const sharesToRedeem = balance < maxRedeemable ? balance : maxRedeemable;

    if (sharesToRedeem > 0n) {
      // Call redeem function
      const hash = await walletClient.writeContract({
        address: vault,
        abi: abi,
        functionName: 'redeem',
        args: [sharesToRedeem, owner, botAddress],
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
