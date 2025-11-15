import type prompts from 'prompts';
import { DEFAULT_VAULT, DEFAULT_OWNER } from './config';

export function getVaultRedeemPrompts(defaults: {
  vault?: string;
  owner?: string;
  delegate?: boolean;
  interval?: number;
}): prompts.PromptObject[] {
  const questions: prompts.PromptObject[] = [];

  questions.push({
    type: 'text',
    name: 'vault',
    message: 'Vault contract address:',
    initial: defaults.vault ?? DEFAULT_VAULT,
    validate: (value: string) =>
      value.startsWith('0x') && value.length === 42 ? true : 'Invalid address format',
  });

  questions.push({
    type: 'text',
    name: 'owner',
    message: 'Owner address (recipient):',
    initial: defaults.owner ?? DEFAULT_OWNER,
    validate: (value: string) =>
      value.startsWith('0x') && value.length === 42 ? true : 'Invalid address format',
  });

  if (defaults.delegate === undefined) {
    questions.push({
      type: 'confirm',
      name: 'delegate',
      message: 'Enable delegate mode?\n  → Non-delegate: User transfers shares to bot, bot redeems\n  → Delegate: User keeps shares & approves bot, bot redeems on behalf\n  Enable?',
      initial: false,
    });
  }

  if (!defaults.interval) {
    questions.push({
      type: 'select',
      name: 'interval',
      message: 'Check interval:',
      choices: [
        { title: '100ms (very fast)', value: 100 },
        { title: '500ms (fast)', value: 500 },
        { title: '1 second (default)', value: 1000 },
        { title: '2 seconds', value: 2000 },
        { title: '5 seconds', value: 5000 },
        { title: '10 seconds', value: 10000 },
      ],
      initial: 2, // Default to 1 second (index 2)
    });
  }

  return questions;
}
