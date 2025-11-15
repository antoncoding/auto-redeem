import { vaultRedeemMode } from './vault-redeem';
import { morphoMarketWithdrawMode } from './auto-withdraw';
import { ModeId, type Mode } from './types';

export const modes: Record<ModeId, Mode> = {
  [ModeId.VaultRedeem]: vaultRedeemMode,
  [ModeId.MorphoMarketWithdraw]: morphoMarketWithdrawMode,
};

export const allModes = Object.values(modes);

export * from './types';
