import chalk from 'chalk';
import { attemptWithdraw, getOperatorAddress, preExecutionCheck } from './executor';
import { getMorphoMarketWithdrawPrompts } from './prompts';
import { ModeId, type Mode, type MorphoMarketWithdrawConfig } from '../types';
import type { BlockchainClients } from '../../core/client-factory';
import { PreCheckError } from './types';
import { createSpinnerLogger } from '../../core/logger';

export async function runMorphoMarketWithdraw(
  clients: BlockchainClients,
  config: MorphoMarketWithdrawConfig
) {
  const { marketId, owner, morphoAddress, interval } = config;
  const botAddress = getOperatorAddress(clients);
  const log = createSpinnerLogger();

  console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold.cyan('  Morpho Market Withdraw Bot'));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.gray('  Market ID:  ') + chalk.white(marketId.slice(0, 20) + '...'));
  console.log(chalk.gray('  Owner:      ') + chalk.white(owner));
  console.log(chalk.gray('  Bot:        ') + chalk.white(botAddress));
  console.log(chalk.gray('  Morpho:     ') + chalk.white(morphoAddress));
  console.log(chalk.gray('  Interval:   ') + chalk.white(`${interval}ms`));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  const warned = new Set<string>();

  async function tick() {
    const preCheck = await preExecutionCheck(clients, {
      morphoAddress,
      marketId: marketId as `0x${string}`,
      owner,
    });

    if (!preCheck.isValid) {
      if (preCheck.error === PreCheckError.NoEth && !warned.has('eth')) {
        log.warn(`⚠️  No ETH for gas. Send ETH to: ${botAddress}`);
        warned.add('eth');
      } else if (preCheck.error === PreCheckError.NotAuthorized && !warned.has('auth')) {
        log.warn(`⚠️  Not authorized. Authorize bot at: https://www.monarchlend.xyz/tools`);
        log.warn(`   Bot address: ${botAddress}`);
        warned.add('auth');
      }
      log.status('Waiting for setup...');
      return;
    }

    if (warned.size) {
      log.success('✓ Setup complete');
      warned.clear();
    }

    const result = await attemptWithdraw(clients, {
      morphoAddress,
      marketId: marketId as `0x${string}`,
      owner,
    });

    if (result.assetsToWithdraw > 0n && result.transactionHash) {
      const explorerUrl = `${clients.chain.blockExplorers?.default.url}/tx/${result.transactionHash}`;
      console.log(chalk.green(`\n💰 Withdrew ${result.assetsToWithdraw} assets → ${owner.slice(0, 10)}...`));
      console.log(chalk.dim(`   ${explorerUrl}\n`));
    }

    if (result.currentSupplyShares > 0n) {
      log.status(
        `Monitoring... (supply: ${result.currentSupplyAssets}, liquidity: ${result.availableLiquidity})`
      );
    } else {
      log.status('Monitoring... (no supply)');
    }
  }

  await tick();
  setInterval(tick, interval);
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
