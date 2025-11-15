# Morpho Market Withdraw Mode

Continuously withdraws liquidity from Morpho lending markets.

## Quick Start

1. **Authorize the bot** at https://www.monarchlend.xyz/tools
2. **Run the script** with your market ID and owner address
3. The bot monitors and withdraws available liquidity automatically

## Parameters

- **Market ID**: Unique identifier for the Morpho market (bytes32 hash)
- **Owner Address**: Your wallet that holds the position
- **Interval**: Time between checks (default: 1000ms)

## Usage

**Interactive:**
```bash
pnpm start
# Select "Morpho Market Withdraw"
```

**Direct:**
```bash
pnpm start:morpho-market-withdraw -- \
  --market-id 0xYOUR_MARKET_ID \
  -o 0xYourWallet \
  --interval 2000
```

## Setup

### 1. Find Your Market ID
Go to https://monarchlend.xyz/ → Connect wallet → View your positions → Copy market ID

### 2. Authorize Bot
- Visit https://www.monarchlend.xyz/tools
- Enter your bot wallet address
- Click "Authorize" to allow bot to manage your positions

### 3. Fund Bot Wallet
Send ETH to bot wallet for gas fees

## How It Works

The bot continuously:
1. Checks available liquidity in the market
2. Withdraws maximum available amount
3. Sends assets to your owner address
4. Handles partial withdrawals when liquidity is limited