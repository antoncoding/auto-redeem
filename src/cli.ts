#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import { modes, getAllModes, type ModeConfig } from './modes';

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

async function main() {
  program
    .name('auto-redeem')
    .description('Multi-mode rescue bot for DeFi protocols')
    .version('2.0.0')
    .option('-m, --mode <mode>', 'Rescue mode: vault-redeem, morpho')
    .option('-v, --vault <address>', 'Vault contract address (for vault-redeem mode)')
    .option('-o, --owner <address>', 'Owner address for receiving redeemed assets')
    .option('--market-id <id>', 'Market ID (for morpho mode)')
    .option('-d, --delegate', 'Enable delegate mode (for vault-redeem mode)', false)
    .option('-i, --interval <ms>', 'Check interval in milliseconds', '1000')
    .option('--no-interactive', 'Skip interactive prompts')
    .action(async (options: CliOptions) => {
      try {
        let modeId = options.mode;

        // If no mode specified and interactive, prompt for mode selection
        if (!modeId && !options.noInteractive) {
          const availableModes = getAllModes();

          const { selectedMode } = await prompts({
            type: 'select',
            name: 'selectedMode',
            message: 'Select rescue mode:',
            choices: availableModes.map(mode => ({
              title: mode.name,
              description: mode.description,
              value: mode.id,
            })),
          });

          // Handle Ctrl+C
          if (!selectedMode) {
            console.log(chalk.yellow('\nOperation cancelled'));
            process.exit(0);
          }

          modeId = selectedMode;
        }

        // Default to vault-redeem if still no mode
        if (!modeId) {
          modeId = 'vault-redeem';
        }

        const mode = modes[modeId];

        if (!mode) {
          console.error(chalk.red(`\n✗ Unknown mode: ${modeId}\n`));
          console.log(chalk.dim('Available modes:'));
          getAllModes().forEach(m => {
            console.log(chalk.dim(`  - ${m.id}: ${m.description}`));
          });
          process.exit(1);
        }

        // Build initial config from CLI options
        const initialConfig: Partial<ModeConfig> = {
          mode: modeId as any,
          interval: parseInt(options.interval ?? '1000', 10),
        };

        // Add mode-specific options
        if (modeId === 'vault-redeem') {
          if (options.vault) initialConfig.vault = options.vault as any;
          if (options.owner) initialConfig.owner = options.owner as any;
          if (options.delegate !== undefined) initialConfig.delegate = options.delegate;
        } else if (modeId === 'morpho') {
          if (options.marketId) initialConfig.marketId = options.marketId;
          if (options.owner) initialConfig.owner = options.owner as any;
        }

        // Get prompts for missing values
        let finalConfig = { ...initialConfig };

        if (!options.noInteractive) {
          const questions = mode.getPrompts(initialConfig);

          if (questions.length > 0) {
            const answers = await prompts(questions);

            // Handle Ctrl+C
            if (Object.keys(answers).length === 0 && questions.length > 0) {
              console.log(chalk.yellow('\nOperation cancelled'));
              process.exit(0);
            }

            finalConfig = { ...finalConfig, ...answers };
          }
        }

        // Validate configuration
        const errors = mode.validateConfig(finalConfig);

        if (errors.length > 0) {
          console.log(chalk.red('\n✗ Configuration Error\n'));
          errors.forEach(error => {
            console.log(chalk.red(`  ✗ ${error}`));
          });
          console.log();
          process.exit(1);
        }

        // Run the mode
        await mode.run(finalConfig as ModeConfig);
      } catch (error) {
        console.error(chalk.red('\n✗ Fatal error:'), error);
        process.exit(1);
      }
    });

  program.parse();
}

main();
