# Changing Networks

The bot can work with any EVM-compatible blockchain supported by viem.

## How to Change Networks

Edit `src/core/client-factory.ts`:

```typescript
import { createPublicClient, createWalletClient, http, Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';  // Change this import

export function createClients(privateKey: string, rpcUrl: string) {
  const account = privateKeyToAccount(`0x${privateKey.replace('0x', '')}` as Address);

  const publicClient = createPublicClient({
    chain: mainnet,  // Change this
    transport: http(rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain: mainnet,  // Change this
    transport: http(rpcUrl),
  });

  return { publicClient, walletClient, account };
}

export type BlockchainClients = ReturnType<typeof createClients>;
```

## Supported Networks

Viem supports many chains out of the box. Here are common ones:

### Mainnets
```typescript
import {
  mainnet,           // Ethereum
  polygon,           // Polygon
  optimism,          // Optimism
  arbitrum,          // Arbitrum
  avalanche,         // Avalanche (current default)
  base,              // Base
  bsc,               // BNB Smart Chain
} from 'viem/chains';
```

### Testnets
```typescript
import {
  sepolia,           // Ethereum Sepolia
  polygonMumbai,     // Polygon Mumbai
  optimismGoerli,    // Optimism Goerli
  arbitrumGoerli,    // Arbitrum Goerli
  avalancheFuji,     // Avalanche Fuji
} from 'viem/chains';
```

### Custom Networks

For networks not included in viem, define your own:

```typescript
import { defineChain } from 'viem';

const myCustomChain = defineChain({
  id: 1234,
  name: 'My Custom Chain',
  network: 'my-custom-chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mycustomchain.com'],
    },
    public: {
      http: ['https://rpc.mycustomchain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://explorer.mycustomchain.com',
    },
  },
});

// Then use it in createClients
const publicClient = createPublicClient({
  chain: myCustomChain,
  transport: http(rpcUrl),
});
```

## RPC URL Configuration

Make sure your `.env` file or interactive CLI input uses the correct RPC URL for your chosen network:

```env
# Avalanche (current default)
RPC_URL=https://avax-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Ethereum
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Polygon
RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Arbitrum
RPC_URL=https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

## RPC Providers

Popular RPC providers:
- **Alchemy**: https://www.alchemy.com/
- **Infura**: https://www.infura.io/
- **QuickNode**: https://www.quicknode.com/
- **Public RPCs**: Check chain documentation (slower, rate-limited)

## Important Notes

1. **Match chain and RPC**: Ensure your RPC URL matches the chain you've configured in code
2. **Gas token**: Make sure your bot wallet has the native token for gas (ETH, AVAX, MATIC, etc.)
3. **Contract addresses**: Vault/market addresses are chain-specific - they won't work across networks
4. **Block times**: Different chains have different block times, which may affect optimal interval settings

## Resources

- [Viem Chains Documentation](https://viem.sh/docs/chains/introduction)
- [List of All Viem Chains](https://github.com/wevm/viem/tree/main/src/chains/definitions)
