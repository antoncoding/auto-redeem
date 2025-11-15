export type Address = `0x${string}`;

export type RedeemConfig = {
  vault: Address;
  owner: Address;
  interval: number;
  delegate?: boolean;
};

export type RedeemResult = {
  success: boolean;
  sharesToRedeem: bigint;
  transactionHash?: string;
  error?: string;
};
