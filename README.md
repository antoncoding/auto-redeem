# Auto-Redeem Rescue Script

A rescue script that continuously attempts to withdraw funds from a vault with limited liquidity.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Configure `.env` file:
```bash
PRIVATE_KEY=your_private_key_here
RPC_URL=https://avax-mainnet.g.alchemy.com/v2/your_api_key
OWNER=0xrecipient_address
```

3. Transfer vault share tokens to the address derived from `PRIVATE_KEY`

## Run

```bash
pnpm start
```

The script will run continuously, checking every 1.5 seconds for available liquidity and automatically redeeming shares when possible.

Press `Ctrl+C` to stop the script.
