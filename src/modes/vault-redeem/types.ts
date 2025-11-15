import type { Address } from '../../types';

export type RedeemResult = {
  success: boolean;
  sharesToRedeem: bigint;
  transactionHash?: string;
  error?: string;
};

export type AttemptRedeemParams = {
  vault: Address;
  owner: Address;
  delegate?: boolean;
};
