# Adding New Rescue Modes

Step-by-step guide to extending the bot with new rescue strategies.

## Steps

### 1. Add Mode to Enum

Edit `src/modes/types.ts`:

```typescript
export enum ModeId {
  VaultRedeem = 'vault-redeem',
  MorphoMarketWithdraw = 'morpho-market-withdraw',
  YourMode = 'your-mode',  // Add this
}
```

### 2. Add Config Type

In the same file:

```typescript
export type YourModeConfig = {
  mode: ModeId.YourMode;  // Discriminant for type narrowing
  // Your config fields
  requiredParam: string;
  optionalParam?: boolean;
  interval: number;
};

// Add to union
export type ModeConfig =
  | VaultRedeemConfig
  | MorphoMarketWithdrawConfig
  | YourModeConfig;  // Add this
```

### 3. Create Mode Directory

Create `src/modes/your-mode/` with the following files:

#### `prompts.ts`
```typescript
import type prompts from 'prompts';

export function getYourModePrompts(defaults: {
  requiredParam?: string;
  optionalParam?: boolean;
  interval?: number;
}): prompts.PromptObject[] {
  const questions: prompts.PromptObject[] = [];

  questions.push({
    type: 'text',
    name: 'requiredParam',
    message: 'Enter required parameter:',
    initial: defaults.requiredParam,
    validate: (value: string) => value.length > 0 ? true : 'Required',
  });

  if (defaults.optionalParam === undefined) {
    questions.push({
      type: 'confirm',
      name: 'optionalParam',
      message: 'Enable optional feature?',
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
```

#### `executor.ts`
```typescript
import type { Address } from '../../types';
import type { BlockchainClients } from '../../core/client-factory';

export type ExecuteParams = {
  requiredParam: string;
  optionalParam?: boolean;
};

export type ExecuteResult = {
  success: boolean;
  // Your result fields
};

export async function executeYourMode(
  clients: BlockchainClients,
  params: ExecuteParams
): Promise<ExecuteResult> {
  const { publicClient, walletClient, account } = clients;

  try {
    // Your logic here

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
    };
  }
}
```

#### `index.ts`
```typescript
import ora from 'ora';
import chalk from 'chalk';
import { ModeId, type YourModeConfig, type Mode } from '../types';
import type { BlockchainClients } from '../../core/client-factory';
import { executeYourMode } from './executor';
import { getYourModePrompts } from './prompts';

export const yourMode: Mode = {
  id: ModeId.YourMode,
  name: 'Your Mode Name',
  description: 'Brief description of what this mode does',
  getPrompts: getYourModePrompts,
  run: async (clients, config) => {
    if (config.mode !== ModeId.YourMode) {
      throw new Error('Invalid config for your-mode');
    }
    await runYourMode(clients, config);
  },
};

export async function runYourMode(
  clients: BlockchainClients,
  config: YourModeConfig
): Promise<void> {
  const { requiredParam, optionalParam, interval } = config;
  const spinner = ora('Initializing Your Mode...').start();

  console.log(chalk.cyan('\n📊 Your Mode Configuration'));
  console.log(chalk.gray('Required Param:'), requiredParam);
  console.log(chalk.gray('Optional Param:'), optionalParam ?? false);
  console.log(chalk.gray('Interval:'), `${interval}ms\n`);

  const attemptExecution = async () => {
    spinner.text = 'Executing your mode...';

    const result = await executeYourMode(clients, {
      requiredParam,
      optionalParam,
    });

    if (result.success) {
      spinner.succeed(chalk.green('Execution successful!'));
    } else {
      spinner.warn(chalk.yellow('No action taken'));
    }
  };

  // Run immediately
  await attemptExecution();

  // Then run at intervals
  setInterval(attemptExecution, interval);
}
```

#### `script.ts` (Direct CLI entry point)
```typescript
#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import { createClients } from '../../core/client-factory';
import { runYourMode } from './index';
import { ModeId } from '../types';

const program = new Command();

async function main() {
  program
    .name('your-mode')
    .description('Your mode description')
    .version('2.0.0')
    .requiredOption('--required-param <value>', 'Description of required param')
    .option('--optional-param', 'Enable optional feature', false)
    .option('-i, --interval <ms>', 'Check interval in milliseconds', '1000')
    .action(async (options) => {
      const privateKey = process.env.PRIVATE_KEY;
      const rpcUrl = process.env.RPC_URL;

      if (!privateKey || !rpcUrl) {
        console.error('\n✗ PRIVATE_KEY and RPC_URL are required in .env file\n');
        process.exit(1);
      }

      const clients = createClients(privateKey, rpcUrl);

      await runYourMode(clients, {
        mode: ModeId.YourMode,
        requiredParam: options.requiredParam,
        optionalParam: options.optionalParam,
        interval: parseInt(options.interval, 10),
      });
    });

  program.parse();
}

main();
```

### 4. Register Mode

Edit `src/modes/index.ts`:

```typescript
import { vaultRedeemMode } from './vault-redeem';
import { morphoMarketWithdrawMode } from './auto-withdraw';
import { yourMode } from './your-mode';  // Add import
import { ModeId } from './types';

export const modes = {
  [ModeId.VaultRedeem]: vaultRedeemMode,
  [ModeId.MorphoMarketWithdraw]: morphoMarketWithdrawMode,
  [ModeId.YourMode]: yourMode,  // Add to registry
};

export const allModes = Object.values(modes);

export * from './types';
```

### 5. Add Script to package.json

```json
{
  "scripts": {
    "start:your-mode": "tsx src/modes/your-mode/script.ts"
  }
}
```

## Testing Your Mode

### Interactive CLI
```bash
pnpm start
# Select "Your Mode Name" from the menu
```

### Direct Script
```bash
pnpm start:your-mode --required-param VALUE
```

## Best Practices

1. **Keep executor pure**: No side effects, just business logic
2. **Use TypeScript discriminated unions**: Mode config with discriminant field
3. **Separate concerns**: Prompts, execution, and presentation in different files
4. **Validate inputs**: Both in prompts and in executor
5. **Handle errors gracefully**: Return error info instead of throwing
6. **Use ora spinners**: For better UX during long operations
7. **Log configuration**: Show user what settings are being used
8. **Support defaults**: Make prompts work with pre-filled values
