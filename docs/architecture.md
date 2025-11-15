# Architecture

The bot uses a modular, mode-based architecture for easy extensibility.

## Project Structure

```
auto-redeem/
├── src/
│   ├── core/                      # Shared infrastructure
│   │   └── client-factory.ts      # Blockchain client factory
│   ├── modes/                     # Rescue mode implementations
│   │   ├── index.ts               # Mode registry
│   │   ├── types.ts               # Base mode types & ModeId enum
│   │   ├── vault-redeem/          # ERC-4626 vault rescue mode
│   │   │   ├── index.ts           # Mode definition & runner
│   │   │   ├── script.ts          # Direct entry point
│   │   │   ├── prompts.ts         # Interactive prompts
│   │   │   ├── config.ts          # Default configuration
│   │   │   ├── executor.ts        # Core redemption logic
│   │   │   ├── abi.ts             # Contract ABI
│   │   │   └── types.ts           # Mode-specific types
│   │   └── auto-withdraw/         # Morpho Market withdraw mode
│   │       ├── index.ts           # Mode definition & runner
│   │       ├── script.ts          # Direct entry point
│   │       └── prompts.ts         # Interactive prompts
│   ├── types.ts                   # Shared TypeScript types
│   ├── cli.ts                     # Interactive CLI entry point
│   └── legacy.ts                  # Legacy simple script
├── docs/                          # Documentation
├── .env                           # Environment variables (optional)
├── package.json
└── README.md
```

## Execution Paths

### 1. Interactive CLI (`pnpm start`)
- Entry: `src/cli.ts`
- Prompts for private key, RPC URL, and mode configuration
- Uses mode's `getPrompts()` function for mode-specific questions
- No `.env` dependency - everything entered interactively
- Secure: credentials never saved to disk

### 2. Direct Script (`pnpm start:vault-redeem`, `pnpm start:morpho-market-withdraw`)
- Entry: `src/modes/*/script.ts`
- Reads credentials from `.env` file
- Accepts mode-specific config via CLI flags
- Fast restarts for stable setups

### 3. Legacy (`pnpm start:legacy`)
- Entry: `src/legacy.ts`
- Original simple implementation
- Vault-redeem mode only
- Basic console.log output

## Key Components

### Client Factory (`src/core/client-factory.ts`)
- Creates viem blockchain clients
- No environment variable dependencies
- Everything passed as parameters
- Returns typed client object

```typescript
export function createClients(privateKey: string, rpcUrl: string) {
  // Creates publicClient, walletClient, account
  return { publicClient, walletClient, account };
}

export type BlockchainClients = ReturnType<typeof createClients>;
```

### Mode Definition (`src/modes/types.ts`)
- Enum-based mode identification
- Discriminated union configs for type safety
- Common interface for all modes

```typescript
export enum ModeId {
  VaultRedeem = 'vault-redeem',
  MorphoMarketWithdraw = 'morpho-market-withdraw',
}

export type Mode = {
  id: ModeId;
  name: string;
  description: string;
  getPrompts: (defaults: any) => prompts.PromptObject[];
  run: (clients: BlockchainClients, config: ModeConfig) => Promise<void>;
};
```

### Executor Pattern
- Pure business logic
- Takes clients + parameters
- Returns results
- No side effects or environment dependencies

```typescript
export async function attemptRedeem(
  clients: BlockchainClients,
  params: AttemptRedeemParams
): Promise<RedeemResult> {
  // Pure logic here
}
```

## Design Principles

### 1. No Environment Dependencies in Core
The `client-factory.ts` and all executor logic receive parameters explicitly. They never read from `process.env`. This makes code:
- Testable
- Reusable
- Predictable

### 2. Viem Types Everywhere
Uses `ReturnType<typeof createClients>` instead of custom type definitions. This:
- Keeps types in sync with implementation
- Leverages viem's excellent type system
- Reduces maintenance burden

### 3. Mode Encapsulation
Each mode's logic, prompts, and config live in its own folder:
- `prompts.ts` - Interactive questions
- `executor.ts` - Core business logic
- `script.ts` - Direct CLI entry point
- `config.ts` - Default values (if applicable)
- `types.ts` - Mode-specific types

### 4. Two Execution Paths
- **Interactive**: Secure, guided (no saved credentials)
- **Direct**: Fast, scriptable (saved credentials)

Both paths use the same core logic, just different data sources.

### 5. Type Safety
Discriminated unions ensure type-safe config handling across modes:

```typescript
export type VaultRedeemConfig = {
  mode: ModeId.VaultRedeem;  // Discriminant
  vault: Address;
  owner: Address;
  delegate?: boolean;
  interval: number;
};

export type ModeConfig = VaultRedeemConfig | MorphoMarketWithdrawConfig;
```

TypeScript can narrow the union type based on the `mode` field.

## Technology Stack

- **Language**: TypeScript
- **Blockchain**: viem (Ethereum client)
- **CLI**: commander (argument parsing), prompts (interactive input)
- **UI**: ora (spinners), chalk (colors)
- **Runtime**: Node.js with tsx
