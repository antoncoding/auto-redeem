# Auto-Redeem Rescue Script

A rescue script that continuously attempts to withdraw funds from a vault with limited liquidity.

**Works with any ERC-4626 compliant vault** - simply update the vault address and network configuration.

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure `.env` file

```env
PRIVATE_KEY=your_private_key_here
RPC_URL=https://avax-mainnet.g.alchemy.com/v2/your_api_key
OWNER=0xrecipient_address
```

- `PRIVATE_KEY`: Private key of the address holding the vault shares
- `RPC_URL`: RPC endpoint for the blockchain network
- `OWNER`: Address where redeemed assets will be sent

### 3. Configure vault address

Update the vault address in `constant.ts`:

```typescript
export const VAULT = '0xYourVaultAddress'
```

**Example**: For the K3 USDT Earn Vault, use `0xE1A62FDcC6666847d5EA752634E45e134B2F824B`

### 4. Transfer vault share tokens

Transfer vault share tokens to the address derived from `PRIVATE_KEY` before running the script.

## Changing Networks

To use a different network, update `client.ts`:

```typescript
import { mainnet } from 'viem/chains'; // Import your desired chain

// Update both clients with the new chain
export const publicClient = createPublicClient({
  chain: mainnet, // Change this to your network
  transport: http(process.env.RPC_URL),
});

export const walletClient = createWalletClient({
  account,
  chain: mainnet, // Change this to your network
  transport: http(process.env.RPC_URL),
});
```

Any network supported by viem can be used. Check the [viem chains documentation](https://viem.sh/docs/chains/introduction) for available networks.

## Run

```bash
pnpm start
```

The script will run continuously, checking every 1 second for available liquidity and automatically redeeming shares when possible.

Press `Ctrl+C` to stop the script.
