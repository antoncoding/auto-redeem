import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalanche } from 'viem/chains';

if (!process.env.PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY is required in .env file');
}

if (!process.env.RPC_URL) {
  throw new Error('RPC_URL is required in .env file');
}

export const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY.replace('0x', '')}`);

export const publicClient = createPublicClient({
  chain: avalanche,
  transport: http(process.env.RPC_URL),
});

export const walletClient = createWalletClient({
  account,
  chain: avalanche,
  transport: http(process.env.RPC_URL),
});
