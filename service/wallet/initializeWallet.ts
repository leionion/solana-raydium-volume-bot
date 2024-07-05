import ecc from "@bitcoinerlab/secp256k1";
import { initEccLib } from "bitcoinjs-lib";
import { SeedWallet } from "./SeedWallet";

initEccLib(ecc as any);

const initializeWallet = (
  networkType: string,
  seed: string,
  index: number
): SeedWallet => {
  const wallet: SeedWallet = new SeedWallet({
    networkType: networkType,
    seed: seed,
    index: index,
  });

  return wallet;
};

export default initializeWallet;
