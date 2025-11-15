import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalanche } from 'viem/chains';

if (!process.env.PRIVATE_KEY) {
  console.error('\n✗ PRIVATE_KEY is required in .env file\n');
  process.exit(1);
}

if (!process.env.RPC_URL) {
  console.error('\n✗ RPC_URL is required in .env file\n');
  process.exit(1);
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
