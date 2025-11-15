import { createPublicClient, createWalletClient, http, type Address, type Chain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as chains from 'viem/chains';

/**
 * Detects the chain from an RPC URL by querying the chain ID
 */
async function detectChain(rpcUrl: string): Promise<Chain> {
  // Create a temporary client without chain to query chain ID
  const tempClient = createPublicClient({
    transport: http(rpcUrl),
  });

  const chainId = await tempClient.getChainId();

  // Find matching chain from viem's built-in chains
  const allChains = Object.values(chains);
  const matchedChain = allChains.find((chain) => chain.id === chainId);

  if (!matchedChain) {
    // If no match, create a minimal chain definition
    return {
      id: chainId,
      name: `Unknown Chain ${chainId}`,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: {
        default: { http: [rpcUrl] },
      },
    };
  }

  return matchedChain;
}

/**
 * Creates blockchain clients with automatic chain detection
 */
export async function createClients(privateKey: string, rpcUrl: string) {
  const account = privateKeyToAccount(`0x${privateKey.replace('0x', '')}` as Address);
  const chain = await detectChain(rpcUrl);

  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });

  return { publicClient, walletClient, account, chain };
}

export type BlockchainClients = Awaited<ReturnType<typeof createClients>>;
