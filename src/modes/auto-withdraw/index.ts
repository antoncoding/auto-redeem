import chalk from 'chalk';
import { ModeId, type Mode, type ModeConfig, type AutoWithdrawConfig } from '../types';

async function runAutoWithdraw(config: AutoWithdrawConfig) {
  console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold.cyan('  Auto Withdraw Bot'));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.yellow('\n  ⚠️  Auto withdraw mode is not yet implemented\n'));
  console.log(chalk.gray('  Market ID:  ') + chalk.white(config.marketId));
  console.log(chalk.gray('  Recipient:  ') + chalk.white(config.owner));
  console.log(chalk.gray('  Interval:   ') + chalk.white(`${config.interval}ms`));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  console.log(chalk.dim('Implementation coming soon...'));
  process.exit(0);
}

export const autoWithdrawMode: Mode = {
  id: ModeId.AutoWithdraw,
  name: 'Auto Withdraw',
  description: 'Continuously withdraw liquidity from markets',
  run: async (config: ModeConfig) => {
    if (config.mode !== ModeId.AutoWithdraw) {
      throw new Error('Invalid config for auto-withdraw mode');
    }
    await runAutoWithdraw(config);
  },
};
