import type prompts from 'prompts';
import { DEFAULT_OWNER } from './config';

export function getMorphoMarketWithdrawPrompts(defaults: {
  marketId?: string;
  owner?: string;
  morphoAddress?: string;
  interval?: number;
}): prompts.PromptObject[] {
  const questions: prompts.PromptObject[] = [];

  questions.push({
    type: 'text',
    name: 'owner',
    message: 'Owner address (position holder):',
    initial: defaults.owner ?? DEFAULT_OWNER,
    validate: (value: string) =>
      value.startsWith('0x') && value.length === 42 ? true : 'Invalid address format',
  });

  if (!defaults.morphoAddress) {
    questions.push({
      type: 'text',
      name: 'morphoAddress',
      message: 'Morpho Blue address (leave empty for auto-detect):',
      initial: '',
      validate: (value: string) =>
        !value || (value.startsWith('0x') && value.length === 42)
          ? true
          : 'Invalid address format',
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

  questions.push({
    type: 'text',
    name: 'marketId',
    message: 'Morpho Market ID (bytes32):',
    initial: defaults.marketId,
    validate: (value: string) =>
      value.startsWith('0x') && value.length === 66
        ? true
        : 'Invalid market ID (must be 32 bytes hex)',
  });

  return questions;
}
