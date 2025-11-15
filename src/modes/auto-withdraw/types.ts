import type { Address } from 'viem';

export type MarketState = {
  totalSupplyAssets: bigint;
  totalSupplyShares: bigint;
  totalBorrowAssets: bigint;
  totalBorrowShares: bigint;
  lastUpdate: bigint;
  fee: bigint;
};

export type Position = {
  supplyShares: bigint;
  borrowShares: bigint;
  collateral: bigint;
};

export type WithdrawResult = {
  success: boolean;
  sharesToWithdraw: bigint;
  assetsToWithdraw: bigint;
  currentSupplyShares: bigint;
  currentSupplyAssets: bigint;
  availableLiquidity: bigint;
  transactionHash?: string;
  error?: string;
};

export type AttemptWithdrawParams = {
  morphoAddress: Address;
  marketId: `0x${string}`;
  owner: Address;
};

export type PreCheckResult = {
  isValid: boolean;
  error?: string;
};
