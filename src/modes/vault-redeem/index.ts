import chalk from 'chalk';
import { attemptRedeem, getOperatorAddress, preExecutionCheck } from './executor';
import { getVaultRedeemPrompts } from './prompts';
import { ModeId, type Mode, type VaultRedeemConfig } from '../types';
import type { BlockchainClients } from '../../core/client-factory';
import { PreCheckError } from './types';
import { createSpinnerLogger } from '../../core/logger';

export async function runVaultRedeem(clients: BlockchainClients, config: VaultRedeemConfig) {
  const { vault, owner, interval, delegate } = config;
  const botAddress = getOperatorAddress(clients);
  const log = createSpinnerLogger();

  console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold.cyan('  ERC-4626 Vault Rescue Bot'));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.gray('  Vault:      ') + chalk.white(vault));
  console.log(chalk.gray('  Recipient:  ') + chalk.white(owner));
  console.log(chalk.gray('  Bot:        ') + chalk.white(botAddress));
  console.log(chalk.gray('  Delegate:   ') + (delegate ? chalk.green('✓ Enabled') : chalk.dim('✗ Disabled')));
  console.log(chalk.gray('  Interval:   ') + chalk.white(`${interval}ms`));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  const warned = new Set<string>();

  async function tick() {
    const preCheck = await preExecutionCheck(clients, { vault, owner, delegate });

    if (!preCheck.isValid) {
      if (preCheck.error === PreCheckError.NoEth && !warned.has('eth')) {
        log.warn(`⚠️  No ETH for gas. Send ETH to: ${botAddress}`);
        warned.add('eth');
      } else if (preCheck.error === PreCheckError.NoApproval && !warned.has('approval')) {
        log.warn(`⚠️  No approval. Owner must approve bot: ${botAddress} for vault: ${vault}`);
        warned.add('approval');
      }
      log.status('Waiting for setup...');
      return;
    }

    if (warned.size) {
      log.success('✓ Setup complete');
      warned.clear();
    }

    const result = await attemptRedeem(clients, { vault, owner, delegate });

    if (result.sharesToRedeem > 0n && result.transactionHash) {
      const explorerUrl = `${clients.chain.blockExplorers?.default.url}/tx/${result.transactionHash}`;
      console.log(chalk.green(`\n💰 Redeemed ${result.sharesToRedeem} shares → ${owner.slice(0, 10)}...`));
      console.log(chalk.dim(`   ${explorerUrl}\n`));
    }

    if (result.currentBalance > 0n) {
      log.status(
        `Monitoring... (balance: ${result.currentBalance}, redeemable: ${result.maxRedeemable})`
      );
    } else {
      log.status('Monitoring... (no balance)');
    }
  }

  await tick();
  setInterval(tick, interval);
}

export const vaultRedeemMode: Mode = {
  id: ModeId.VaultRedeem,
  name: 'ERC-4626 Vault Redeem',
  description: 'Continuously redeem shares from ERC-4626 vaults',
  getPrompts: getVaultRedeemPrompts,
  run: async (clients, config) => {
    if (config.mode !== ModeId.VaultRedeem) {
      throw new Error('Invalid config for vault-redeem mode');
    }
    await runVaultRedeem(clients, config);
  },
};
