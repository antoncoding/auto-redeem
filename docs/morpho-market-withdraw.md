# Morpho Market Withdraw Mode

Continuously attempts to withdraw liquidity from Morpho lending markets.

## How It Works


## Parameters

### Market ID
- **Description**: The unique identifier for the Morpho market

### Owner Address
- **Description**: Recipient address for withdrawn assets (your main wallet)

### Interval
- **Description**: Time between withdrawal attempts
- **Default**: `1000` (1 second)

## Example Usage

**Interactive CLI:**
```bash
pnpm start
# Select "Morpho Market Withdraw"
# Follow prompts
```

**Direct Script:**
```bash
pnpm start:morpho-market-withdraw \
  --market-id YOUR_MARKET_ID \
  --owner 0xYourMainWallet \
  --interval 1000
```

## How to Find Market ID

1. Go to https://monarchlend.xyz/ to find the target market
2. Go to the position page after connecting your wallet to Monarch, it should show all the "market positions" you have.