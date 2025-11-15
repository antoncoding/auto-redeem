# Morpho Market Withdraw Mode

Continuously attempts to withdraw liquidity from Morpho lending markets.

## How It Works

1. **Checks supplied balance**: Reads how much liquidity the bot wallet has supplied
2. **Checks withdrawable amount**: Queries the market's current available liquidity
3. **Attempts withdrawal**: Withdraws the maximum available amount
4. **Repeats continuously**: Runs at specified interval until all funds are withdrawn

## Parameters

### Market ID
- **Description**: The unique identifier for the Morpho market
- **Format**: Market-specific ID string
- **Where to find**: Morpho protocol UI or documentation
- **Example**: `0x...` (market-specific hash)

### Owner Address
- **Description**: Recipient address for withdrawn assets (your main wallet)
- **Format**: Ethereum address (0x...)
- **Why separate**: The bot wallet holds the position, but sends withdrawn assets to your secure main wallet

### Interval
- **Description**: Time between withdrawal attempts
- **Format**: Milliseconds
- **Default**: `1000` (1 second)
- **Recommendation**: 1000ms for active rescue, 5000-10000ms for passive monitoring

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

1. Visit the Morpho protocol UI
2. Navigate to your supplied position
3. Find the market ID in the URL or market details
4. Or check the transaction hash on a block explorer

## Troubleshooting

**No balance to withdraw:**
- Ensure you've transferred your Morpho position to the bot wallet
- Verify you're using the correct market ID

**Transaction fails:**
- Ensure bot wallet has enough native tokens for gas
- Check if market has withdrawal restrictions
- Verify the market ID is correct
