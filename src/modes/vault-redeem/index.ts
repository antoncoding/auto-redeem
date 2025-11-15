import ora from 'ora';
import chalk from 'chalk';
import { attemptRedeem, getOperatorAddress, preExecutionCheck } from './executor';
import { getVaultRedeemPrompts } from './prompts';
import { ModeId, type Mode, type ModeConfig, type VaultRedeemConfig } from '../types';
import type { BlockchainClients } from '../../core/client-factory';

export async function runVaultRedeem(clients: BlockchainClients, config: VaultRedeemConfig) {
  const { vault, owner, interval, delegate } = config;

  const botAddress = getOperatorAddress(clients);

  console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold.cyan('  ERC-4626 Vault Rescue Bot'));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.gray('  Vault:      ') + chalk.white(vault));
  console.log(chalk.gray('  Recipient:  ') + chalk.white(owner));
  console.log(chalk.gray('  Bot:        ') + chalk.white(botAddress));
  console.log(chalk.gray('  Delegate:   ') + (delegate ? chalk.green('✓ Enabled') : chalk.dim('✗ Disabled')));
  console.log(chalk.gray('  Interval:   ') + chalk.white(`${interval}ms`));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  // Pre-execution checks
  const preCheckSpinner = ora(chalk.blue('Running pre-execution checks...')).start();
  const preCheckResult = await preExecutionCheck(clients, { vault, owner, delegate });

  if (!preCheckResult.isValid) {
    preCheckSpinner.fail(chalk.red('Pre-execution check failed!'));
    console.log(chalk.red(`Error: ${preCheckResult.error}`));
    process.exit(1);
  }

  preCheckSpinner.succeed(chalk.green('Pre-execution checks passed'));
  console.log('');

  let attemptCount = 0;
  let spinner: ReturnType<typeof ora> | null = null;
  let hasShownZeroBalanceWarning = false;

  async function attempt() {
    attemptCount++;

    try {
      const result = await attemptRedeem(clients, { vault, owner, delegate });

      // Display helpful status when balance is zero
      if (result.currentBalance === 0n && !hasShownZeroBalanceWarning) {
        if (spinner) {
          spinner.stop();
          spinner = null;
        }

        console.log(chalk.yellow('\n⚠️  No vault shares detected!'));
        console.log(chalk.gray('─'.repeat(50)));

        if (delegate) {
          console.log(chalk.white(`  Owner has no vault shares.`));
          console.log(chalk.gray('  Please transfer vault shares to: ') + chalk.cyan(owner));
        } else {
          console.log(chalk.white(`  Bot has no vault shares.`));
          console.log(chalk.gray('  Please transfer vault shares to: ') + chalk.cyan(botAddress));
        }

        console.log(chalk.gray('  Vault token address: ') + chalk.white(vault));
        console.log(chalk.gray('─'.repeat(50)));
        console.log('');

        hasShownZeroBalanceWarning = true;
      }

      if (result.sharesToRedeem > 0n) {
        if (spinner) {
          spinner.stop();
          spinner = null;
        }

        ora(chalk.green(`Found redeemable shares: ${chalk.bold(result.sharesToRedeem.toString())} tokens`)).succeed();

        const txSpinner = ora(chalk.blue('Submitting redemption transaction...')).start();

        if (result.success && result.transactionHash) {
          txSpinner.succeed(chalk.green(`Transaction confirmed: ${chalk.dim(result.transactionHash)}`));
          console.log(chalk.green.bold(`💰 Redeemed ${result.sharesToRedeem.toString()} tokens → sent to ${owner.slice(0, 10)}...`));
        } else {
          txSpinner.fail(chalk.red('Transaction failed!'));
          if (result.error) console.log(chalk.red(`Error: ${result.error}`));
        }

        spinner = ora(chalk.blue(`Watching vault... (attempt #${attemptCount + 1})`)).start();
      } else {
        // Build status message with balance info
        const statusParts = [`attempt #${attemptCount}`];

        if (result.currentBalance > 0n) {
          statusParts.push(`balance: ${result.currentBalance.toString()}`);
          if (result.maxRedeemable === 0n) {
            statusParts.push(chalk.yellow('(vault paused/locked)'));
          }
        }

        const statusMessage = chalk.blue(`Watching vault... (${statusParts.join(', ')})`);

        if (!spinner) {
          spinner = ora(statusMessage).start();
        } else {
          spinner.text = statusMessage;
        }
      }
    } catch (error) {
      if (spinner) {
        spinner.fail(chalk.red('Error during redeem attempt'));
        console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
        spinner = ora(chalk.blue(`Watching vault... (attempt #${attemptCount + 1})`)).start();
      }
    }
  }

  await attempt();
  setInterval(attempt, interval);
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
