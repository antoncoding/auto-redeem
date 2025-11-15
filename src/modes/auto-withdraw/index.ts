import chalk from 'chalk';
import { ModeId, type Mode, type ModeConfig, type MorphoMarketWithdrawConfig } from '../types';

async function runMorphoMarketWithdraw(config: MorphoMarketWithdrawConfig) {
  console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold.cyan('  Morpho Market Withdraw Bot'));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.yellow('\n  ⚠️  Morpho market withdraw mode is not yet implemented\n'));
  console.log(chalk.gray('  Market ID:  ') + chalk.white(config.marketId));
  console.log(chalk.gray('  Recipient:  ') + chalk.white(config.owner));
  console.log(chalk.gray('  Interval:   ') + chalk.white(`${config.interval}ms`));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  console.log(chalk.dim('Implementation coming soon...'));
  process.exit(0);
}

export const morphoMarketWithdrawMode: Mode = {
  id: ModeId.MorphoMarketWithdraw,
  name: 'Morpho Market Withdraw',
  description: 'Continuously withdraw liquidity from Morpho markets',
  run: async (config: ModeConfig) => {
    if (config.mode !== ModeId.MorphoMarketWithdraw) {
      throw new Error('Invalid config for morpho-market-withdraw mode');
    }
    await runMorphoMarketWithdraw(config);
  },
};
