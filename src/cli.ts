#!/usr/bin/env node
import 'dotenv/config';
import prompts from 'prompts';
import chalk from 'chalk';
import type { Address } from 'viem';
import { createClients } from './core/client-factory';
import { modes, allModes, ModeId, type ModeConfig } from './modes';
import { getMorphoAddress } from './modes/auto-withdraw/config';

async function main() {
  console.log(chalk.bold.cyan('\n🚀 DeFi Rescue Bot - Interactive Mode\n'));

  // Mode selection
  const { selectedMode } = await prompts({
    type: 'select',
    name: 'selectedMode',
    message: 'Select rescue mode:',
    choices: allModes.map((mode) => ({
      title: mode.name,
      description: mode.description,
      value: mode.id,
    })),
  });

  if (!selectedMode) {
    console.log(chalk.yellow('\nOperation cancelled'));
    process.exit(0);
  }

  const mode = modes[selectedMode as ModeId];

  // Blockchain configuration
  console.log(chalk.cyan('\n📡 Blockchain Configuration'));

  const blockchainAnswers = await prompts([
    {
      type: 'password',
      name: 'privateKey',
      message: 'Private key (bot wallet):',
      validate: (value: string) => (value.length > 0 ? true : 'Private key is required'),
    },
    {
      type: 'text',
      name: 'rpcUrl',
      message: 'RPC URL:',
      initial: process.env.RPC_URL,
      validate: (value: string) => (value.startsWith('http') ? true : 'Must be a valid URL'),
    },
  ]);

  if (!blockchainAnswers.privateKey || !blockchainAnswers.rpcUrl) {
    console.log(chalk.yellow('\nOperation cancelled'));
    process.exit(0);
  }

  // Create blockchain clients
  const clients = await createClients(blockchainAnswers.privateKey, blockchainAnswers.rpcUrl);

  // Mode-specific configuration
  console.log(chalk.cyan(`\n⚙️  ${mode.name} Configuration`));

  const modePrompts = mode.getPrompts({});
  const modeAnswers = await prompts(modePrompts);

  if (Object.keys(modeAnswers).length === 0 && modePrompts.length > 0) {
    console.log(chalk.yellow('\nOperation cancelled'));
    process.exit(0);
  }

  // Build config based on mode
  let config: ModeConfig;

  if (selectedMode === ModeId.VaultRedeem) {
    config = {
      mode: ModeId.VaultRedeem,
      vault: modeAnswers.vault,
      owner: modeAnswers.owner,
      delegate: modeAnswers.delegate ?? false,
      interval: modeAnswers.interval ?? 1000,
    };
  } else if (selectedMode === ModeId.MorphoMarketWithdraw) {
    // Determine Morpho address
    let morphoAddress: Address;
    if (modeAnswers.morphoAddress) {
      morphoAddress = modeAnswers.morphoAddress as Address;
    } else {
      const detectedAddress = getMorphoAddress(clients.chain.id);
      if (!detectedAddress) {
        console.error(
          chalk.red(`\n✗ Unknown chain: ${clients.chain.name} (${clients.chain.id}). Cannot auto-detect Morpho address.\n`)
        );
        process.exit(1);
      }
      morphoAddress = detectedAddress;
      console.log(chalk.cyan(`Auto-detected Morpho Blue for ${clients.chain.name}: ${morphoAddress}\n`));
    }

    config = {
      mode: ModeId.MorphoMarketWithdraw,
      marketId: modeAnswers.marketId,
      owner: modeAnswers.owner,
      morphoAddress,
      interval: modeAnswers.interval ?? 1000,
    };
  } else {
    console.error(chalk.red(`\n✗ Unknown mode: ${selectedMode}\n`));
    process.exit(1);
  }

  // Run the mode
  await mode.run(clients, config);
}

main().catch((error) => {
  console.error(chalk.red('\n✗ Fatal error:'), error);
  process.exit(1);
});
