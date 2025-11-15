# Vault Redeem Mode

Continuously attempts to redeem shares from ERC-4626 compliant vaults with limited liquidity.

## How It Works

1. **Checks vault balance**: Reads how many vault shares the bot wallet holds
2. **Checks max redeemable**: Queries the vault's current liquidity limit
3. **Attempts redemption**: Redeems the minimum of (balance, max redeemable)
4. **Repeats continuously**: Runs at specified interval until all shares are redeemed

## Parameters

### Vault Address
- **Description**: The ERC-4626 vault contract address
- **Format**: Ethereum address (0x...)
- **Example**: `0xE1A62FDcC6666847d5EA752634E45e134B2F824B`

### Owner Address
- **Description**: Recipient address for redeemed assets (your main wallet)
- **Format**: Ethereum address (0x...)
- **Why separate**: The bot wallet holds the shares, but sends redeemed assets to your secure main wallet

### Delegate Mode (Optional)
- **Description**: Whether to use delegate redemption
- **Default**: `false`
- **When to enable**: Some vaults support delegate operations where a bot can redeem on behalf of the owner

### Interval
- **Description**: Time between withdrawal attempts
- **Format**: Milliseconds
- **Default**: `1000` (1 second)
- **Recommendation**: 1000ms for active rescue, 5000-10000ms for passive monitoring

## Example Usage

**Interactive CLI:**
```bash
pnpm start
# Select "ERC-4626 Vault Redeem"
# Follow prompts
```

**Direct Script:**
```bash
pnpm start:vault-redeem \
  --vault 0xE1A62FDcC6666847d5EA752634E45e134B2F824B \
  --owner 0xYourMainWallet \
  --interval 1000
```

## How to Find Vault Address

1. Check the DeFi protocol's documentation
2. Look at your transaction history on block explorer
3. Use the protocol's UI to find the vault contract

## Supported Vaults

Any ERC-4626 compliant vault, including:
- Yearn V3 vaults
- ERC-4626 wrappers
- Custom yield aggregators implementing the standard

## Troubleshooting

**No shares to redeem:**
- Make sure you've transferred vault shares to the bot wallet address
- Check the bot wallet address in the console output (shown as "Operator")

**Transaction fails:**
- Ensure bot wallet has enough native tokens for gas
- Check if vault has withdrawal delays or restrictions
- Verify the vault implements ERC-4626 correctly
