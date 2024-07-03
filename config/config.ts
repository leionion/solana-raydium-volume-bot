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

let PRIVATE_KEY_TEMP = "";
if (networkType == TESTNET) {
  PRIVATE_KEY_TEMP = process.env.PRIVATE_KEY_TESTNET as string;
} else {
  PRIVATE_KEY_TEMP = process.env.PRIVATE_KEY_MAINNET as string;
}
export const PRIVATE_KEY = PRIVATE_KEY_TEMP;

// Maximum output size for rune airdrop
export const ONE_TIME_AIRDROP_SIZE = 8;

// Redeem address for mainnet and testnet
export const TESTNET_REDEEM_ADDRESS =
  "tb1p0sd5xq6sz0eg3r9j5df0qk38pgnuqreav2qqtq5jfvwpk3yhzuxqjyttjy";
export const MAINNET_REDEEM_ADDRESS =
  "bc1p0sd5xq6sz0eg3r9j5df0qk38pgnuqreav2qqtq5jfvwpk3yhzuxq9vaygt";
