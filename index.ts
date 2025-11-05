import 'dotenv/config';
import { publicClient, walletClient, account } from './client';
import { VAULT, OWNER } from './constant';
import { abi } from './abi';
import { maxUint256 } from 'viem';

type Address = `0x${string}`;

const INTERVAL_MS = 1000; // Try every 1 second

async function attemptRedeem() {
  try {
    const botAddress = account.address;
    console.log(`\n[${new Date().toISOString()}] Checking vault for address: ${botAddress}`);

    // Read balance and maxRedeem in parallel
    const [balance, maxRedeemable] = await Promise.all([
      publicClient.readContract({
        address: VAULT as Address,
        abi: abi,
        functionName: 'balanceOf',
        args: [botAddress],
      }) as Promise<bigint>,
      publicClient.readContract({
        address: VAULT as Address,
        abi: abi,
        functionName: 'maxRedeem',
        args: [botAddress],
      }) as Promise<bigint>,
    ]);

    console.log(`Balance: ${balance.toString()}`);
    console.log(`Max Redeemable: ${maxRedeemable.toString()}`);

    // Take minimum of balance and maxRedeemable
    const sharesToRedeem = balance < maxRedeemable ? balance : maxRedeemable;

    if (sharesToRedeem > 0n) {
      console.log(`\n🎯 Found ${sharesToRedeem.toString()} shares to redeem!`);
      console.log(`Attempting to redeem to recipient: ${OWNER}`);

      // Call redeem function
      const hash = await walletClient.writeContract({
        address: VAULT as Address,
        abi: abi,
        functionName: 'redeem',
        args: [sharesToRedeem, OWNER, botAddress],
      });

      console.log(`✅ Transaction sent! Hash: ${hash}`);
      console.log(`Waiting for confirmation...`);

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        console.log(`✅ Transaction confirmed! Block: ${receipt.blockNumber}`);
      } else {
        console.log(`❌ Transaction failed!`);
      }
    } else {
      console.log('No shares available to redeem at this time.');
    }
  } catch (error) {
    console.error('Error during redeem attempt:', error);
  }
}

async function main() {
  console.log('🚀 Auto-redeem rescue script starting...');
  console.log(`Vault: ${VAULT}`);
  console.log(`Recipient: ${OWNER}`);
  console.log(`Operator: ${account.address}`);
  console.log(`Check interval: ${INTERVAL_MS}ms\n`);

  // Run immediately
  await attemptRedeem();

  // Then run at intervals
  setInterval(attemptRedeem, INTERVAL_MS);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
