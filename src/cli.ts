#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import { modes, allModes, ModeId, type ModeConfig } from './modes';
import { VAULT, OWNER } from './core/constants';
import type { Address } from './types';

const program = new Command();

type CliOptions = {
  mode?: string;
  vault?: string;
  owner?: string;
  marketId?: string;
  delegate?: boolean;
  interval?: string;
  noInteractive?: boolean;
};

async function getModeConfig(modeId: ModeId, options: CliOptions): Promise<ModeConfig> {
  let configInterval = parseInt(options.interval ?? '1000', 10);

  if (modeId === ModeId.VaultRedeem) {
    let vault = options.vault ?? VAULT;
    let owner = options.owner ?? OWNER;
    let delegate = options.delegate ?? false;

    if (!options.noInteractive) {
      const answers = await prompts([
        {
          type: options.vault ? null : 'text',
          name: 'vault',
          message: 'Vault contract address:',
          initial: VAULT,
        },
        {
          type: options.owner ? null : 'text',
          name: 'owner',
          message: 'Owner address (recipient):',
          initial: OWNER,
        },
        {
          type: options.delegate !== undefined ? null : 'confirm',
          name: 'delegate',
          message: 'Enable delegate mode?',
          initial: false,
        },
        {
          type: options.interval ? null : 'number',
          name: 'interval',
          message: 'Check interval (ms):',
          initial: 1000,
          min: 100,
        },
      ]);

      if (Object.keys(answers).length === 0 && !options.vault) {
        console.log(chalk.yellow('\nOperation cancelled'));
        process.exit(0);
      }

      vault = answers.vault ?? vault;
      owner = answers.owner ?? owner;
      delegate = answers.delegate ?? delegate;
      configInterval = answers.interval ?? configInterval;
    }

    if (!vault || !owner) {
      console.log(chalk.red('\n✗ Vault and owner addresses are required\n'));
      process.exit(1);
    }

    return {
      mode: ModeId.VaultRedeem,
      vault: vault as Address,
      owner: owner as Address,
      delegate,
      interval: configInterval,
    };
  }

  if (modeId === ModeId.MorphoMarketWithdraw) {
    let marketId = options.marketId ?? '';
    let owner = options.owner ?? OWNER;

    if (!options.noInteractive) {
      const answers = await prompts([
        {
          type: options.marketId ? null : 'text',
          name: 'marketId',
          message: 'Market ID:',
        },
        {
          type: options.owner ? null : 'text',
          name: 'owner',
          message: 'Owner address (recipient):',
          initial: OWNER,
        },
        {
          type: options.interval ? null : 'number',
          name: 'interval',
          message: 'Check interval (ms):',
          initial: 1000,
          min: 100,
        },
      ]);

      if (Object.keys(answers).length === 0 && !options.marketId) {
        console.log(chalk.yellow('\nOperation cancelled'));
        process.exit(0);
      }

      marketId = answers.marketId ?? marketId;
      owner = answers.owner ?? owner;
      configInterval = answers.interval ?? configInterval;
    }

    if (!marketId || !owner) {
      console.log(chalk.red('\n✗ Market ID and owner address are required\n'));
      process.exit(1);
    }

    return {
      mode: ModeId.MorphoMarketWithdraw,
      marketId,
      owner: owner as Address,
      interval: configInterval,
    };
  }

  throw new Error(`Unknown mode: ${modeId}`);
}

async function main() {
  program
    .name('auto-redeem')
    .description('Multi-mode rescue bot for DeFi protocols')
    .version('2.0.0')
    .option('-m, --mode <mode>', `Rescue mode: ${Object.values(ModeId).join(', ')}`)
    .option('-v, --vault <address>', 'Vault contract address (vault-redeem mode)')
    .option('-o, --owner <address>', 'Owner address for receiving assets')
    .option('--market-id <id>', 'Market ID (auto-withdraw mode)')
    .option('-d, --delegate', 'Enable delegate mode (vault-redeem mode)', false)
    .option('-i, --interval <ms>', 'Check interval in milliseconds', '1000')
    .option('--no-interactive', 'Skip interactive prompts')
    .action(async (options: CliOptions) => {
      try {
        let modeId: ModeId | undefined = options.mode as ModeId;

        // Mode selection prompt
        if (!modeId && !options.noInteractive) {
          const { selectedMode } = await prompts({
            type: 'select',
            name: 'selectedMode',
            message: 'Select rescue mode:',
            choices: allModes.map(mode => ({
              title: mode.name,
              description: mode.description,
              value: mode.id,
            })),
          });

          if (!selectedMode) {
            console.log(chalk.yellow('\nOperation cancelled'));
            process.exit(0);
          }

          modeId = selectedMode;
        }

        // Default to vault-redeem
        modeId = modeId ?? ModeId.VaultRedeem;

        const mode = modes[modeId];
        if (!mode) {
          console.error(chalk.red(`\n✗ Unknown mode: ${modeId}\n`));
          process.exit(1);
        }

        // Get mode configuration
        const config = await getModeConfig(modeId, options);

        // Run the mode
        await mode.run(config);
      } catch (error) {
        console.error(chalk.red('\n✗ Fatal error:'), error);
        process.exit(1);
      }
    });

  program.parse();
}

main();
