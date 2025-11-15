import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalanche } from 'viem/chains';
import type { Address } from '../types';

export function createClients(privateKey: string, rpcUrl: string) {
  const account = privateKeyToAccount(`0x${privateKey.replace('0x', '')}` as Address);

  const publicClient = createPublicClient({
    chain: avalanche,
    transport: http(rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain: avalanche,
    transport: http(rpcUrl),
  });

  return { publicClient, walletClient, account };
}

export type BlockchainClients = ReturnType<typeof createClients>;
