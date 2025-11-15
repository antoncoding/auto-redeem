import 'dotenv/config';
import { Address } from 'viem';
import { Command } from 'commander';
import { createClients } from '../../core/client-factory';
import { DEFAULT_VAULT, DEFAULT_OWNER } from './config';
import { runVaultRedeem } from './index';
import { ModeId } from '../types';

const program = new Command();

async function main() {
  program
    .name('vault-redeem')
    .description('ERC-4626 Vault Redeem rescue bot')
    .version('2.0.0')
    .option('-v, --vault <address>', 'Vault contract address', DEFAULT_VAULT)
    .option('-o, --owner <address>', 'Owner address', DEFAULT_OWNER)
    .option('-d, --delegate', 'Enable delegate mode', false)
    .option('-i, --interval <ms>', 'Check interval in milliseconds', '1000')
    .action(async (options) => {
      const privateKey = process.env.PRIVATE_KEY;
      const rpcUrl = process.env.RPC_URL;

      if (!privateKey || !rpcUrl) {
        console.error('\n✗ PRIVATE_KEY and RPC_URL are required in .env file\n');
        process.exit(1);
      }

      if (!options.vault || !options.owner) {
        console.error('\n✗ Vault and owner addresses are required\n');
        console.error('Use --vault and --owner flags or set defaults in config.ts\n');
        process.exit(1);
      }

      const clients = createClients(privateKey, rpcUrl);

      await runVaultRedeem(clients, {
        mode: ModeId.VaultRedeem,
        vault: options.vault as Address,
        owner: options.owner as Address,
        delegate: options.delegate,
        interval: parseInt(options.interval, 10),
      });
    });

  program.parse();
}

main();
