export const VAULT = '0xE1A62FDcC6666847d5EA752634E45e134B2F824B'

if (!process.env.OWNER) {
  console.error('\n✗ OWNER is required in .env file\n');
  process.exit(1);
}

export const OWNER = process.env.OWNER
