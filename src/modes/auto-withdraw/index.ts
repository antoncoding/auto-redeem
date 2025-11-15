import chalk from 'chalk';
import { getMorphoMarketWithdrawPrompts } from './prompts';
import { ModeId, type Mode, type ModeConfig, type MorphoMarketWithdrawConfig } from '../types';
import type { BlockchainClients } from '../../core/client-factory';

export async function runMorphoMarketWithdraw(
  clients: BlockchainClients,
  config: MorphoMarketWithdrawConfig
) {
  console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold.cyan('  Morpho Market Withdraw Bot'));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.yellow('\n  ⚠️  Morpho Market withdraw mode is not yet implemented\n'));
  console.log(chalk.gray('  Market ID:  ') + chalk.white(config.marketId));
  console.log(chalk.gray('  Recipient:  ') + chalk.white(config.owner));
  console.log(chalk.gray('  Operator:   ') + chalk.white(clients.account.address));
  console.log(chalk.gray('  Interval:   ') + chalk.white(`${config.interval}ms`));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  console.log(chalk.dim('Implementation coming soon...'));
  process.exit(0);
}

export const morphoMarketWithdrawMode: Mode = {
  id: ModeId.MorphoMarketWithdraw,
  name: 'Morpho Market Withdraw',
  description: 'Continuously withdraw liquidity from Morpho markets',
  getPrompts: getMorphoMarketWithdrawPrompts,
  run: async (clients, config) => {
    if (config.mode !== ModeId.MorphoMarketWithdraw) {
      throw new Error('Invalid config for morpho-market-withdraw mode');
    }
    await runMorphoMarketWithdraw(clients, config);
  },
};
