import { publicClient, walletClient, account } from './client';
import { abi } from './abi';
import type { Address, RedeemResult } from '../types';

export type AttemptRedeemParams = {
  vault: Address;
  owner: Address;
  delegate?: boolean;
};

export async function attemptRedeem(params: AttemptRedeemParams): Promise<RedeemResult> {
  const { vault, owner, delegate = false } = params;

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

export function getOperatorAddress(): Address {
  return account.address;
}
