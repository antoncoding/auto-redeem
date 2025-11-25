# Setup Guide

This guide will help you gather everything you need before running the bot.

## 1. Generate a One-Time Bot Wallet

**Important:** Never use your main wallet. Create a fresh wallet just for this bot.

**Easy option:** Use [vanity-eth.tk](https://vanity-eth.tk/) to generate a new wallet instantly in your browser.

1. Visit https://vanity-eth.tk/
2. Click "Generate" to create a new wallet
3. Save both the **Address** and **Private Key** securely
4. Send some ETH to this address for gas fees (0.01-0.05 ETH should be enough)

## 2. Get an RPC URL

You need an RPC endpoint to connect to the blockchain. Free options:

### Alchemy (Recommended)
1. Visit https://dashboard.alchemy.com/
2. Sign up for a free account
3. Create a new app
4. Select the network you need (e.g., Ethereum Mainnet, Base, Arbitrum)
5. Copy the HTTPS URL

### Chainstack
1. Visit https://chainstack.com/
2. Sign up for a free account
3. Deploy a node on your desired network
4. Copy the endpoint URL

## 3. Get Your Vault or Market Address

### For ERC-4626 Vault Redeem:
- You need the **vault contract address** where your shares are stuck
- Example: `0x1234...` (starts with 0x, 42 characters)
- You can usually find this in the DeFi protocol's interface or from the transaction where you deposited

### For Morpho Market Withdraw:
- You need the **Market ID** (a 32-byte hex string)
- Example: `0xabcd...` (starts with 0x, 66 characters)
- Find this on Morpho's interface or block explorer when viewing your position

## 4. Set Your Owner Address

This is **your main wallet address** where you want rescued funds sent.

- Use your actual secure wallet address (e.g., hardware wallet, MetaMask main account)
- The bot wallet just performs the rescue; funds go to this owner address

## 5. Authorization (For Morpho Markets Only)

If using Morpho Market Withdraw mode:

1. Visit https://www.monarchlend.xyz/tools
2. Connect your **main wallet** (the one with the stuck funds)
3. Authorize your **bot wallet address** to act on your behalf
4. Confirm the transaction

## Ready to Run

Once you have:
- ✅ Bot wallet private key
- ✅ RPC URL
- ✅ Vault/Market address
- ✅ Owner address (your main wallet)
- ✅ Authorization (if using Morpho)

Run `pnpm start` and the interactive CLI will guide you through the rest!
