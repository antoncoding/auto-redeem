# Direct Script Mode Setup

For advanced users who want to save configuration and avoid entering credentials each time.

## Setup

Create a `.env` file in the project root:

```env
PRIVATE_KEY=your_bot_wallet_private_key
RPC_URL=https://avax-mainnet.g.alchemy.com/v2/your_api_key
OWNER=your_main_wallet_address
```

## Usage

### Vault Redeem

```bash
pnpm start:vault-redeem \
  --vault 0xVaultAddress \
  --owner 0xOwnerAddress \
  --interval 1000
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
