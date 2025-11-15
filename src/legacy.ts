import 'dotenv/config';
import { Address } from 'viem';
import { createClients } from './core/client-factory';
import { DEFAULT_VAULT, DEFAULT_OWNER } from './modes/vault-redeem/config';
import { attemptRedeem } from './modes/vault-redeem/executor';

if (!process.env.PRIVATE_KEY || !process.env.RPC_URL) {
  console.error('\n✗ PRIVATE_KEY and RPC_URL are required in .env file\n');
  process.exit(1);
}

if (!DEFAULT_OWNER) {
  console.error('\n✗ OWNER is required in .env file or set DEFAULT_OWNER in vault-redeem/config.ts\n');
  process.exit(1);
}

const INTERVAL_MS = 1000; // Try every 1 second

async function attemptRedeemWithLogging() {
  const clients = await createClients(process.env.PRIVATE_KEY as string, process.env.RPC_URL as string);
  const botAddress = clients.account.address;
  console.log(`\n[${new Date().toISOString()}] Checking vault for address: ${botAddress}`);

  const result = await attemptRedeem(clients, {
    vault: DEFAULT_VAULT as Address,
    owner: DEFAULT_OWNER as Address,
  });

  if (result.sharesToRedeem > 0n) {
    console.log(`\n🎯 Found ${result.sharesToRedeem.toString()} shares to redeem!`);
    console.log(`Attempting to redeem to recipient: ${DEFAULT_OWNER}`);

    if (result.success && result.transactionHash) {
      console.log(`✅ Transaction sent! Hash: ${result.transactionHash}`);
      console.log(`Waiting for confirmation...`);
      console.log(`✅ Transaction confirmed!`);
    } else {
      console.log(`❌ Transaction failed!`);
    }
  } else {
    console.log('No shares available to redeem at this time.');
  }
}

async function main() {
  const clients = await createClients(process.env.PRIVATE_KEY!, process.env.RPC_URL!);

  console.log('🚀 Auto-redeem rescue script starting...');
  console.log(`Vault: ${DEFAULT_VAULT}`);
  console.log(`Recipient: ${DEFAULT_OWNER}`);
  console.log(`Operator: ${clients.account.address}`);
  console.log(`Check interval: ${INTERVAL_MS}ms\n`);

  // Run immediately
  await attemptRedeemWithLogging();

  // Then run at intervals
  setInterval(attemptRedeemWithLogging, INTERVAL_MS);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
