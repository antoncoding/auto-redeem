import type { Address } from '../types';

export enum ModeId {
  VaultRedeem = 'vault-redeem',
  AutoWithdraw = 'auto-withdraw',
}

export type VaultRedeemConfig = {
  mode: ModeId.VaultRedeem;
  vault: Address;
  owner: Address;
  delegate?: boolean;
  interval: number;
};

export type AutoWithdrawConfig = {
  mode: ModeId.AutoWithdraw;
  marketId: string;
  owner: Address;
  interval: number;
};

export type ModeConfig = VaultRedeemConfig | AutoWithdrawConfig;

export type Mode = {
  id: ModeId;
  name: string;
  description: string;
  run: (config: ModeConfig) => Promise<void>;
};

