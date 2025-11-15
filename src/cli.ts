#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import prompts from 'prompts';
import ora from 'ora';
import chalk from 'chalk';
import { account } from './core/client';
import { VAULT, OWNER } from './core/constants';
import { attemptRedeem, getOperatorAddress } from './core/redeem';
import type { Address, RedeemConfig } from './types';

const program = new Command();

type CliOptions = {
  delegate?: boolean;
  interval?: string;
  vault?: string;
  owner?: string;
  noInteractive?: boolean;
};

async function runBot(config: RedeemConfig) {
  const { vault, owner, interval, delegate } = config;

  console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold.cyan('  Auto-Redeem Rescue Bot'));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.gray('  Vault:      ') + chalk.white(vault));
  console.log(chalk.gray('  Recipient:  ') + chalk.white(owner));
  console.log(chalk.gray('  Operator:   ') + chalk.white(getOperatorAddress()));
  console.log(chalk.gray('  Delegate:   ') + (delegate ? chalk.green('✓ Enabled') : chalk.dim('✗ Disabled')));
  console.log(chalk.gray('  Interval:   ') + chalk.white(`${interval}ms`));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  let attemptCount = 0;
  let spinner: ora.Ora | null = null;

  async function attempt() {
    attemptCount++;

    try {
      const result = await attemptRedeem({
        vault: vault as Address,
        owner: owner as Address,
        delegate,
      });

      if (result.sharesToRedeem > 0n) {
        // Stop the persistent spinner if it exists
        if (spinner) {
          spinner.stop();
          spinner = null;
        }

        const successSpinner = ora(chalk.green(`Found redeemable shares: ${chalk.bold(result.sharesToRedeem.toString())} tokens`)).succeed();

        const txSpinner = ora(chalk.blue('Submitting redemption transaction...')).start();

        if (result.success && result.transactionHash) {
          txSpinner.succeed(chalk.green(`Transaction confirmed: ${chalk.dim(result.transactionHash)}`));
          console.log(chalk.green.bold(`💰 Redeemed ${result.sharesToRedeem.toString()} tokens → sent to ${owner.slice(0, 10)}...`));
        } else {
          txSpinner.fail(chalk.red('Transaction failed!'));
          if (result.error) {
            console.log(chalk.red(`Error: ${result.error}`));
          }
        }

        // Restart the persistent spinner
        spinner = ora(chalk.blue(`Watching vault... (attempt #${attemptCount + 1})`)).start();
      } else {
        // Update the existing spinner or create a new one
        if (!spinner) {
          spinner = ora(chalk.blue(`Watching vault... (attempt #${attemptCount})`)).start();
        } else {
          spinner.text = chalk.blue(`Watching vault... (attempt #${attemptCount})`);
        }
      }
    } catch (error) {
      if (spinner) {
        spinner.fail(chalk.red('Error during redeem attempt'));
        console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
        // Restart spinner after error
        spinner = ora(chalk.blue(`Watching vault... (attempt #${attemptCount + 1})`)).start();
      }
    }
  }

  // Run immediately
  await attempt();

  // Then run at intervals
  setInterval(attempt, interval);
}

program
  .name('auto-redeem')
  .description('Continuously attempts to withdraw funds from ERC-4626 vaults')
  .version('2.0.0')
  .option('-d, --delegate', 'Enable delegate mode', false)
  .option('-i, --interval <ms>', 'Check interval in milliseconds', '1000')
  .option('-v, --vault <address>', 'Vault contract address')
  .option('-o, --owner <address>', 'Owner address for receiving redeemed assets')
  .option('--no-interactive', 'Skip interactive prompts and use defaults/flags only')
  .action(async (options: CliOptions) => {
    try {
      let vault = options.vault ?? VAULT;
      let owner = options.owner ?? OWNER;
      let delegate = options.delegate ?? false;
      let interval = parseInt(options.interval ?? '1000', 10);

      // Interactive prompts if not disabled
      if (options.noInteractive !== true) {
        const questions: prompts.PromptObject[] = [];

        // Only prompt for missing values
        if (!options.vault && !vault) {
          questions.push({
            type: 'text',
            name: 'vault',
            message: 'Vault contract address:',
            initial: VAULT,
          });
        }

        if (!options.owner && !owner) {
          questions.push({
            type: 'text',
            name: 'owner',
            message: 'Owner address (recipient):',
            initial: OWNER,
          });
        }

        if (!options.delegate) {
          questions.push({
            type: 'confirm',
            name: 'delegate',
            message: 'Enable delegate mode?',
            initial: false,
          });
        }

        if (!options.interval || options.interval === '1000') {
          questions.push({
            type: 'number',
            name: 'interval',
            message: 'Check interval (ms):',
            initial: 1000,
            min: 100,
          });
        }

        if (questions.length > 0) {
          const answers = await prompts(questions);

          // Handle Ctrl+C
          if (Object.keys(answers).length === 0) {
            console.log(chalk.yellow('\nOperation cancelled'));
            process.exit(0);
          }

          vault = answers.vault ?? vault;
          owner = answers.owner ?? owner;
          delegate = answers.delegate ?? delegate;
          interval = answers.interval ?? interval;
        }
      }

      // Validation
      if (!vault) {
        console.error(chalk.red('Error: Vault address is required'));
        process.exit(1);
      }

      if (!owner) {
        console.error(chalk.red('Error: Owner address is required'));
        process.exit(1);
      }

      if (interval < 100) {
        console.error(chalk.red('Error: Interval must be at least 100ms'));
        process.exit(1);
      }

      await runBot({
        vault: vault as Address,
        owner: owner as Address,
        interval,
        delegate,
      });
    } catch (error) {
      console.error(chalk.red('Fatal error:'), error);
      process.exit(1);
    }
  });

program.parse();
