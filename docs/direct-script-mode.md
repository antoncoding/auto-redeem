# Direct Script Mode Setup

For advanced users who want to save configuration and avoid entering credentials each time.

## Setup

### 1. Create `.env` file

Create a `.env` file in the project root:

```env
PRIVATE_KEY=your_bot_wallet_private_key
RPC_URL=https://avax-mainnet.g.alchemy.com/v2/your_api_key
OWNER=your_main_wallet_address
```

### 2. Environment Variables

**PRIVATE_KEY** (required)
- The private key of your one-time bot wallet
- Format: Without the `0x` prefix
- Security: Never use your main wallet's private key

**RPC_URL** (required)
- The RPC endpoint URL for the blockchain network
- Example: `https://avax-mainnet.g.alchemy.com/v2/API_KEY`
- Providers: Alchemy, Infura, QuickNode, or public RPCs

**OWNER** (optional)
- Your main wallet address where redeemed assets will be sent
- Can be overridden with `--owner` flag
- Format: Ethereum address (0x...)

### 3. Set Default Addresses (Optional)

Edit `src/modes/vault-redeem/config.ts` for vault-redeem defaults:

```typescript
export const DEFAULT_VAULT = '0xYourVaultAddress';
export const DEFAULT_OWNER = process.env.OWNER ?? '';
```

These are used as default values when flags are omitted.

## Usage

### Vault Redeem

```bash
# With all parameters
pnpm start:vault-redeem \
  --vault 0xVaultAddress \
  --owner 0xOwnerAddress \
  --interval 1000

# Using defaults from config.ts
pnpm start:vault-redeem

# With delegate mode
pnpm start:vault-redeem --vault 0xVaultAddress --owner 0xOwnerAddress --delegate
```

**Available flags:**
- `-v, --vault <address>` - Vault contract address
- `-o, --owner <address>` - Owner address for receiving assets
- `-d, --delegate` - Enable delegate mode (default: false)
- `-i, --interval <ms>` - Check interval in milliseconds (default: 1000)

### Morpho Market Withdraw

```bash
pnpm start:morpho-market-withdraw \
  --market-id YOUR_MARKET_ID \
  --owner 0xOwnerAddress \
  --interval 1000
```

**Available flags:**
- `--market-id <id>` - Morpho Market ID (required)
- `-o, --owner <address>` - Owner address for receiving assets (required)
- `-i, --interval <ms>` - Check interval in milliseconds (default: 1000)

## Security Considerations

**Pros:**
- Fast restarts without re-entering credentials
- Good for stable, long-running setups
- Easy to script and automate

**Cons:**
- Credentials stored in plaintext `.env` file
- File could be accidentally committed to git (use `.gitignore`)
- Less secure than interactive mode where credentials are never saved

**Best Practices:**
- Always use a fresh, one-time wallet as the bot wallet
- Never commit `.env` to version control
- Only fund the bot wallet with the exact amount needed
- Set owner address to your secure main wallet
