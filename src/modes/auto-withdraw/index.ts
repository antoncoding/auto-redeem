import ora from 'ora';
import chalk from 'chalk';
import { attemptWithdraw, getOperatorAddress, preExecutionCheck } from './executor';
import { getMorphoMarketWithdrawPrompts } from './prompts';
import { ModeId, type Mode, type MorphoMarketWithdrawConfig } from '../types';
import type { BlockchainClients } from '../../core/client-factory';
import type { WithdrawResult } from './types';

type WarningState = {
  zeroBalance: boolean;
  authorization: boolean;
  eth: boolean;
  noLiquidity: boolean;
};

function showWarningBox(title: string, message: string, details: Record<string, string>) {
  console.log(chalk.yellow(`\n⚠️  ${title}`));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.white(`  ${message}`));
  Object.entries(details).forEach(([key, value]) => {
    console.log(chalk.gray(`  ${key}: `) + chalk.cyan(value));
  });
  console.log(chalk.gray('─'.repeat(50)));
  console.log('');
}

function updateSpinner(
  spinner: ReturnType<typeof ora> | null,
  message: string
): ReturnType<typeof ora> {
  if (!spinner) return ora(message).start();
  spinner.text = message;
  return spinner;
}

function stopSpinner(spinner: ReturnType<typeof ora> | null): null {
  spinner?.stop();
  return null;
}

export async function runMorphoMarketWithdraw(
  clients: BlockchainClients,
  config: MorphoMarketWithdrawConfig
) {
  const { marketId, owner, morphoAddress, interval } = config;
  const botAddress = getOperatorAddress(clients);

  console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold.cyan('  Morpho Market Withdraw Bot'));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.gray('  Market ID:  ') + chalk.white(marketId.slice(0, 20) + '...'));
  console.log(chalk.gray('  Owner:      ') + chalk.white(owner));
  console.log(chalk.gray('  Bot:        ') + chalk.white(botAddress));
  console.log(chalk.gray('  Morpho:     ') + chalk.white(morphoAddress));
  console.log(chalk.gray('  Interval:   ') + chalk.white(`${interval}ms`));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  let attemptCount = 0;
  let spinner: ReturnType<typeof ora> | null = null;
  let preChecksPassed = false;
  const warnings: WarningState = {
    zeroBalance: false,
    authorization: false,
    eth: false,
    noLiquidity: false,
  };

  async function handlePreChecks(): Promise<boolean> {
    const result = await preExecutionCheck(clients, {
      morphoAddress,
      marketId: marketId as `0x${string}`,
      owner,
    });

    if (result.isValid) {
      spinner = stopSpinner(spinner);
      ora(chalk.green('✓ All checks passed, starting market monitoring...')).succeed();
      console.log('');
      return true;
    }

    spinner = stopSpinner(spinner);

    if (result.error?.includes('No ETH') && !warnings.eth) {
      showWarningBox('No ETH for gas!', 'Bot needs ETH to pay for transaction gas.', {
        'Please send ETH to': botAddress,
      });
      warnings.eth = true;
    }

    if (result.error?.includes('authorized') && !warnings.authorization) {
      showWarningBox(
        'Authorization required!',
        'Owner must authorize bot to manage Morpho positions.',
        {
          'Owner must call setAuthorization for bot': botAddress,
          'On Morpho Blue contract': morphoAddress,
        }
      );
      warnings.authorization = true;
    }

    spinner = updateSpinner(spinner, chalk.blue(`Waiting for setup... (attempt #${attemptCount})`));
    return false;
  }

  async function handleWithdrawAttempt(result: WithdrawResult) {
    if (result.currentSupplyShares === 0n && !warnings.zeroBalance) {
      spinner = stopSpinner(spinner);
      showWarningBox('No supply shares detected!', 'Owner has no supply in this market.', {
        'Market ID': marketId,
        'Owner address': owner,
      });
      warnings.zeroBalance = true;
    }

    if (
      result.currentSupplyShares > 0n &&
      result.availableLiquidity === 0n &&
      !warnings.noLiquidity
    ) {
      spinner = stopSpinner(spinner);
      showWarningBox(
        'No liquidity available!',
        'Market has no available liquidity for withdrawal.',
        {
          'Supply shares': result.currentSupplyShares.toString(),
          'Supply assets': result.currentSupplyAssets.toString(),
          'Available liquidity': '0 (all borrowed)',
        }
      );
      warnings.noLiquidity = true;
    }

    if (result.assetsToWithdraw > 0n) {
      spinner = stopSpinner(spinner);
      const isPartial = result.availableLiquidity < result.currentSupplyAssets;

      ora(
        chalk.green(
          `Found withdrawable assets: ${chalk.bold(result.assetsToWithdraw.toString())} ${
            isPartial ? chalk.yellow('(partial)') : ''
          }`
        )
      ).succeed();

      const txSpinner = ora(chalk.blue('Submitting withdrawal transaction...')).start();

      if (result.success && result.transactionHash) {
        txSpinner.succeed(chalk.green(`Transaction confirmed: ${chalk.dim(result.transactionHash)}`));
        console.log(
          chalk.green.bold(
            `💰 Withdrew ${result.assetsToWithdraw.toString()} assets → sent to ${owner.slice(0, 10)}...`
          )
        );
        if (isPartial) {
          console.log(
            chalk.yellow(
              `   Remaining: ${(result.currentSupplyAssets - result.assetsToWithdraw).toString()} assets (waiting for liquidity)`
            )
          );
        }
      } else {
        txSpinner.fail(chalk.red('Transaction failed!'));
        if (result.error) console.log(chalk.red(`Error: ${result.error}`));
      }

      spinner = ora(chalk.blue(`Watching market... (attempt #${attemptCount + 1})`)).start();
      return;
    }

    const statusParts = [`attempt #${attemptCount}`];
    if (result.currentSupplyShares > 0n) {
      statusParts.push(`shares: ${result.currentSupplyShares.toString()}`);
      statusParts.push(`assets: ${result.currentSupplyAssets.toString()}`);
      if (result.availableLiquidity === 0n) {
        statusParts.push(chalk.yellow('(no liquidity)'));
      } else if (result.availableLiquidity < result.currentSupplyAssets) {
        statusParts.push(
          chalk.yellow(`(partial liquidity: ${result.availableLiquidity.toString()})`)
        );
      }
    }

    spinner = updateSpinner(spinner, chalk.blue(`Watching market... (${statusParts.join(', ')})`));
  }

  async function attempt() {
    attemptCount++;

    try {
      if (!preChecksPassed) {
        preChecksPassed = await handlePreChecks();
        if (!preChecksPassed) return;
      }

      const result = await attemptWithdraw(clients, {
        morphoAddress,
        marketId: marketId as `0x${string}`,
        owner,
      });
      await handleWithdrawAttempt(result);
    } catch (error) {
      spinner = stopSpinner(spinner);
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      spinner = ora(chalk.blue(`Watching market... (attempt #${attemptCount + 1})`)).start();
    }
  }

  await attempt();
  setInterval(attempt, interval);
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
