import type { Address } from 'viem';

export enum PreCheckError {
  NoEth = 'NO_ETH',
  NoApproval = 'NO_APPROVAL',
}

export type RedeemResult = {
  success: boolean;
  sharesToRedeem: bigint;
  currentBalance: bigint;
  maxRedeemable: bigint;
  transactionHash?: string;
};

export type AttemptRedeemParams = {
  vault: Address;
  owner: Address;
  delegate?: boolean;
};

export type PreCheckResult = {
  isValid: boolean;
  error?: PreCheckError;
};
