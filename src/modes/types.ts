import type prompts from 'prompts';
import type { Address } from 'viem';
import type { BlockchainClients } from '../core/client-factory';

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
  morphoAddress: Address;
  interval: number;
};

export type ModeConfig = VaultRedeemConfig | MorphoMarketWithdrawConfig;

export type Mode = {
  id: ModeId;
  name: string;
  description: string;
  getPrompts: (defaults: any) => prompts.PromptObject[];
  run: (clients: BlockchainClients, config: ModeConfig) => Promise<void>;
};

