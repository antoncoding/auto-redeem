import ora from 'ora';
import chalk from 'chalk';
import { attemptRedeem, getOperatorAddress, preExecutionCheck } from './executor';
import { getVaultRedeemPrompts } from './prompts';
import { ModeId, type Mode, type VaultRedeemConfig } from '../types';
import type { BlockchainClients } from '../../core/client-factory';
import type { RedeemResult } from './types';

type WarningState = {
  zeroBalance: boolean;
  approval: boolean;
  eth: boolean;
};

function showWarningBox(title: string, message: string, details: Record<string, string>) {
  console.log(chalk.yellow(`\n⚠️  ${title}`));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.white(`  ${message}`));
  Object.entries(details).forEach(([key, value]) => {
    console.log(chalk.gray(`  ${key}: `) + chalk.cyan(value));
  });
  console.log(chalk.gray('─'.repeat(50)));
  console.log('');
}

function updateSpinner(
  spinner: ReturnType<typeof ora> | null,
  message: string
): ReturnType<typeof ora> {
  if (!spinner) return ora(message).start();
  spinner.text = message;
  return spinner;
}

function stopSpinner(spinner: ReturnType<typeof ora> | null): null {
  spinner?.stop();
  return null;
}

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

  let attemptCount = 0;
  let spinner: ReturnType<typeof ora> | null = null;
  let preChecksPassed = false;
  const warnings: WarningState = { zeroBalance: false, approval: false, eth: false };

  async function handlePreChecks(): Promise<boolean> {
    const result = await preExecutionCheck(clients, { vault, owner, delegate });

    if (result.isValid) {
      spinner = stopSpinner(spinner);
      ora(chalk.green('✓ All checks passed, starting vault monitoring...')).succeed();
      console.log('');
      return true;
    }

    spinner = stopSpinner(spinner);

    if (result.error?.includes('No ETH for gas') && !warnings.eth) {
      showWarningBox('No ETH for gas!', 'Bot needs ETH to pay for transaction gas.', {
        'Please send ETH to': botAddress
      });
      warnings.eth = true;
    }

    if (result.error?.includes('no allowance') && !warnings.approval) {
      showWarningBox('Approval required!', "Bot needs approval to spend owner's vault shares.", {
        'Owner must approve bot address': botAddress,
        'Vault token address': vault
      });
      warnings.approval = true;
    }

    spinner = updateSpinner(spinner, chalk.blue(`Waiting for setup... (attempt #${attemptCount})`));
    return false;
  }

  async function handleRedeemAttempt(result: RedeemResult) {
    if (result.currentBalance === 0n && !warnings.zeroBalance) {
      spinner = stopSpinner(spinner);
      const target = delegate ? owner : botAddress;
      showWarningBox('No vault shares detected!', `${delegate ? 'Owner' : 'Bot'} has no vault shares.`, {
        'Please transfer vault shares to': target,
        'Vault token address': vault
      });
      warnings.zeroBalance = true;
    }

    if (result.sharesToRedeem > 0n) {
      spinner = stopSpinner(spinner);
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
      return;
    }

    const statusParts = [`attempt #${attemptCount}`];
    if (result.currentBalance > 0n) {
      statusParts.push(`balance: ${result.currentBalance.toString()}`);
      if (result.maxRedeemable === 0n) {
        statusParts.push(chalk.yellow('(vault paused/locked)'));
      }
    }

    spinner = updateSpinner(spinner, chalk.blue(`Watching vault... (${statusParts.join(', ')})`));
  }

  async function attempt() {
    attemptCount++;

    try {
      if (!preChecksPassed) {
        preChecksPassed = await handlePreChecks();
        if (!preChecksPassed) return;
      }

      const result = await attemptRedeem(clients, { vault, owner, delegate });
      await handleRedeemAttempt(result);
    } catch (error) {
      spinner = stopSpinner(spinner);
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      spinner = ora(chalk.blue(`Watching vault... (attempt #${attemptCount + 1})`)).start();
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
