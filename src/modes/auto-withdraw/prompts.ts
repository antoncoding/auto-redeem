import type prompts from 'prompts';

export function getMorphoMarketWithdrawPrompts(defaults: {
  marketId?: string;
  owner?: string;
  interval?: number;
}): prompts.PromptObject[] {
  const questions: prompts.PromptObject[] = [];

  questions.push({
    type: 'text',
    name: 'marketId',
    message: 'Morpho Market ID:',
    initial: defaults.marketId,
    validate: (value: string) => (value.length > 0 ? true : 'Market ID is required'),
  });

  questions.push({
    type: 'text',
    name: 'owner',
    message: 'Owner address (recipient):',
    initial: defaults.owner,
    validate: (value: string) =>
      value.startsWith('0x') && value.length === 42 ? true : 'Invalid address format',
  });

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
