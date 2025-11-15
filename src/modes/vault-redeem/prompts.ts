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
      message: 'Enable delegate mode?',
      initial: false,
    });
  }

  if (!defaults.interval) {
    questions.push({
      type: 'number',
      name: 'interval',
      message: 'Check interval (ms):',
      initial: 1000,
      min: 100,
    });
  }

  return questions;
}
