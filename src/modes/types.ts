import type { Address } from '../types';

export enum ModeId {
  VaultRedeem = 'vault-redeem',
  MorphoMarketWithdraw = 'morpho-market-withdraw',
}

export type VaultRedeemConfig = {
  mode: ModeId.VaultRedeem;
  vault: Address;
  owner: Address;
  delegate?: boolean;
  interval: number;
};

export type MorphoMarketWithdrawConfig = {
  mode: ModeId.MorphoMarketWithdraw;
  marketId: string;
  owner: Address;
  interval: number;
};

export type ModeConfig = VaultRedeemConfig | MorphoMarketWithdrawConfig;

export type Mode = {
  id: ModeId;
  name: string;
  description: string;
  run: (config: ModeConfig) => Promise<void>;
};

