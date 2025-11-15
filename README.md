# Auto Redeem

A flexible rescue bot that continuously attempts to withdraw funds from DeFi protocols with limited liquidity.

**Supports multiple rescue modes:**
- **ERC-4626 Vault Redeem** - Works with any ERC-4626 compliant vault
- **Morpho Market Withdraw** - Withdraw liquidity from Morpho markets

## ⚠️ Security Warning

**Always create a fresh, one-time wallet to run this bot. Never use your main wallet's private key.**

**How to do this safely:**
1. Generate a new wallet at [vanity-eth.tk](https://vanity-eth.tk/) or using any wallet generator
2. Transfer to this bot wallet:
   - The vault shares or positions you want to rescue
   - A small amount of native token (ETH) for gas fees
3. When running the bot, set your main wallet as the `OWNER` - this is where rescued assets will be sent

This way, even if something goes wrong, only the bot wallet is at risk, not your main funds.

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Run the bot

```bash
pnpm start
```

That's it! The interactive CLI will guide you through everything.

## How It Works

The bot uses an interactive CLI that guides you through the entire setup process:

1. **Select a rescue mode** - Choose between ERC-4626 Vault Redeem or Morpho Market Withdraw
2. **Enter credentials** - Provide your bot wallet's private key and RPC URL
3. **Configure settings** - Set vault/market addresses, recipient address, and monitoring interval
4. **Automated monitoring** - The bot continuously checks and executes withdrawals when liquidity is available


### Available Rescue Modes

Learn more about each mode:
- **[Vault Redeem](./docs/vault-redeem.md)** - Withdraw from ERC-4626 vaults with delegate/non-delegate options
- **[Morpho Market Withdraw](./docs/morpho-market-withdraw.md)** - Withdraw from Morpho lending markets

**To stop the bot**: Press `Ctrl+C`

## Advanced Usage

### Direct Script Mode

For power users who want quick restarts with saved configuration:

```bash
# Vault Redeem
pnpm start:vault-redeem --vault 0xYourVault --owner 0xYourAddress

# Morpho Market Withdraw
pnpm start:morpho-market-withdraw --market-id YOUR_MARKET_ID --owner 0xYourAddress
```

Requires a `.env` file with `PRIVATE_KEY` and `RPC_URL`.

See [docs/direct-script-mode.md](./docs/direct-script-mode.md) for complete setup instructions.

### Legacy Mode

Simple logging output without interactive UI:

```bash
pnpm start:legacy
```

## Documentation

- **[Direct Script Mode Setup](./docs/direct-script-mode.md)** - Advanced configuration with `.env` files
- **[Adding New Modes](./docs/adding-modes.md)** - Developer guide for extending the bot
