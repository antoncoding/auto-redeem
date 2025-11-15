#!/usr/bin/env node
import 'dotenv/config';
import { Address } from 'viem';
import { Command } from 'commander';
import { createClients } from '../../core/client-factory';
import { runMorphoMarketWithdraw } from './index';
import { ModeId } from '../types';

const program = new Command();

async function main() {
  program
    .name('morpho-market-withdraw')
    .description('Morpho Market withdraw rescue bot')
    .version('2.0.0')
    .requiredOption('--market-id <id>', 'Morpho Market ID')
    .requiredOption('-o, --owner <address>', 'Owner address')
    .option('-i, --interval <ms>', 'Check interval in milliseconds', '1000')
    .action(async (options) => {
      const privateKey = process.env.PRIVATE_KEY;
      const rpcUrl = process.env.RPC_URL;

      if (!privateKey || !rpcUrl) {
        console.error('\n✗ PRIVATE_KEY and RPC_URL are required in .env file\n');
        process.exit(1);
      }

      const clients = createClients(privateKey, rpcUrl);

      await runMorphoMarketWithdraw(clients, {
        mode: ModeId.MorphoMarketWithdraw,
        marketId: options.marketId,
        owner: options.owner as Address,
        interval: parseInt(options.interval, 10),
      });
    });

  program.parse();
}

main();
