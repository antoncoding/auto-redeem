# Vault Redeem Mode

Continuously attempts to redeem shares from ERC-4626 compliant vaults with limited liquidity.

## How It Works

## Parameters

### Vault Address
- **Description**: The ERC-4626 vault contract address

### Owner Address
- **Description**: Recipient address for redeemed assets (your main wallet)

### Delegate Mode (Optional)
- **Description**: Whether to use delegate redemption
- **Default**: `false`

### Interval
- **Description**: Time between withdrawal attempts
- **Default**: `1000` (1 second)

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
