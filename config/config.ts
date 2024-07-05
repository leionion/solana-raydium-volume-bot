import dotenv from "dotenv";
dotenv.config();

try {
  dotenv.config();
} catch (error) {
  console.error("Error loading environment variables:", error);
  process.exit(1);
}

export const PORT = process.env.PORT || 5000;

export const TESTNET = "testnet";
export const MAINNET = "mainnet";

export const networkType = process.env.NETWORKTYPE ?? "testnet";

export const SEND_UTXO_FEE_LIMIT = 10000;

export const SEED = process.env.SEED as string;

// Maximum output size for rune airdrop
export const ONE_TIME_AIRDROP_SIZE = 8;

// Redeem address for mainnet and testnet
export const TESTNET_REDEEM_ADDRESS =
  "tb1p0sd5xq6sz0eg3r9j5df0qk38pgnuqreav2qqtq5jfvwpk3yhzuxqjyttjy";
export const MAINNET_REDEEM_ADDRESS =
  "bc1p0sd5xq6sz0eg3r9j5df0qk38pgnuqreav2qqtq5jfvwpk3yhzuxq9vaygt";

export const REDEEM_TRANSACTION_HASH =
  "4444e6e4b16fdc12cce2b96c29da410f27b044fa6e718c7459d5ab2b667623f0";
// inscription standard utxo value
export const STANDARD_RUNE_UTXO_VALUE = 330;

// redeem rune id for calculate estimate fee
export const REDEEM_RUNE_ID = "2586233:1009";
