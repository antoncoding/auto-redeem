import { vaultRedeemMode } from './vault-redeem';
import { morphoMode } from './morpho';
import type { ModeRegistry } from './types';

export const modes: ModeRegistry = {
  'vault-redeem': vaultRedeemMode,
  'morpho': morphoMode,
};

export function getModeById(id: string) {
  return modes[id];
}

export function getAllModes() {
  return Object.values(modes);
}

export * from './types';
