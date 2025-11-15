#!/usr/bin/env node
import 'dotenv/config';
import { Address } from 'viem';
import { Command } from 'commander';
import { createClients } from '../../core/client-factory';
import { runMorphoMarketWithdraw } from './index';
import { getMorphoAddress } from './config';
import { ModeId } from '../types';
import chalk from 'chalk';

const program = new Command();

async function main() {
  program
    .name('morpho-market-withdraw')
    .description('Morpho Market withdraw rescue bot')
    .version('2.0.0')
    .requiredOption('--market-id <id>', 'Morpho Market ID (bytes32)')
    .requiredOption('-o, --owner <address>', 'Owner address')
    .option('--morpho <address>', 'Morpho Blue contract address (auto-detect if not provided)')
    .option('-i, --interval <ms>', 'Check interval in milliseconds', '1000')
    .action(async (options) => {
      const privateKey = process.env.PRIVATE_KEY;
      const rpcUrl = process.env.RPC_URL;

      if (!privateKey || !rpcUrl) {
        console.error('\n✗ PRIVATE_KEY and RPC_URL are required in .env file\n');
        process.exit(1);
      }

      const clients = await createClients(privateKey, rpcUrl);
      let morphoAddress: Address;

      if (options.morpho) {
        morphoAddress = options.morpho as Address;
        console.log(chalk.cyan(`Using provided Morpho address: ${morphoAddress}`));
      } else {
        const detectedAddress = getMorphoAddress(clients.chain.id);
        if (!detectedAddress) {
          console.error(
            chalk.red(
              `\n✗ Unknown chain: ${clients.chain.name} (${clients.chain.id}). Please provide Morpho address with --morpho flag\n`
            )
          );
          process.exit(1);
        }
        morphoAddress = detectedAddress;
        console.log(chalk.cyan(`Auto-detected Morpho address for ${clients.chain.name}: ${morphoAddress}`));
      }

      await runMorphoMarketWithdraw(clients, {
        mode: ModeId.MorphoMarketWithdraw,
        marketId: options.marketId,
        owner: options.owner as Address,
        morphoAddress,
        interval: parseInt(options.interval, 10),
      });
    });

  await program.parseAsync();
}

main();
