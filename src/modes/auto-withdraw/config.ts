import type { Address } from 'viem';

// Morpho Blue contract addresses by chain ID
export const MORPHO_ADDRESSES: Record<number, Address> = {
  1: '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb', // Mainnet
  8453: '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb', // Base
  137: '0x1bf0c2541f820e775182832f06c0b7fc27a25f67', // Polygon
  130: '0x8f5ae9cddb9f68de460c77730b018ae7e04a140a', // Unichain
  42161: '0x6c247b1F6182318877311737BaC0844bAa518F5e', // Arbitrum
  999: '0x68e37dE8d93d3496ae143F2E900490f6280C57cD', // HyperEVM
};

export function getMorphoAddress(chainId: number): Address | undefined {
  return MORPHO_ADDRESSES[chainId];
}

// Default configuration
export const DEFAULT_OWNER = process.env.OWNER ?? '';
