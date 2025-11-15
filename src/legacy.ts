import 'dotenv/config';
import { account } from './core/client';
import { VAULT, OWNER } from './core/constants';
import { attemptRedeem } from './core/redeem';
import type { Address } from './types';

const INTERVAL_MS = 1000; // Try every 1 second

async function attemptRedeemWithLogging() {
  const botAddress = account.address;
  console.log(`\n[${new Date().toISOString()}] Checking vault for address: ${botAddress}`);

  const result = await attemptRedeem({
    vault: VAULT as Address,
    owner: OWNER as Address,
  });

  if (result.sharesToRedeem > 0n) {
    console.log(`\n🎯 Found ${result.sharesToRedeem.toString()} shares to redeem!`);
    console.log(`Attempting to redeem to recipient: ${OWNER}`);

    if (result.success && result.transactionHash) {
      console.log(`✅ Transaction sent! Hash: ${result.transactionHash}`);
      console.log(`Waiting for confirmation...`);
      console.log(`✅ Transaction confirmed!`);
    } else {
      console.log(`❌ Transaction failed!`);
      if (result.error) {
        console.error(`Error: ${result.error}`);
      }
    }
  } else {
    console.log('No shares available to redeem at this time.');
  }

  if (result.error) {
    console.error('Error during redeem attempt:', result.error);
  }
}

async function main() {
  console.log('🚀 Auto-redeem rescue script starting...');
  console.log(`Vault: ${VAULT}`);
  console.log(`Recipient: ${OWNER}`);
  console.log(`Operator: ${account.address}`);
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
