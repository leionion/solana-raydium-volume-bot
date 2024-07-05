import { ITreeItem } from "../../utils/types";
import * as Bitcoin from "bitcoinjs-lib";
import { MAINNET, SEED, TESTNET, networkType } from "../../config/config";
import { RuneId, Runestone, none } from "runelib";
import initializeWallet from "../wallet/initializeWallet";
import { SeedWallet } from "../wallet/SeedWallet";

// Initialize seed Wallet
const wallet: SeedWallet = initializeWallet(networkType, SEED, 0);

export const createAirdropRunestoneTx = (
  data: ITreeItem,
  rune_id: string
): string => {
  //Create psbt instance
  const psbt = new Bitcoin.Psbt({
    network:
      networkType == TESTNET
        ? Bitcoin.networks.testnet
        : Bitcoin.networks.bitcoin,
  });

  // Create redeem Runestone
  const edicts: any = [];
  for (let i = 0; i < data.children.length; i++) {
    edicts.push({
      id: new RuneId(+rune_id.split(":")[0], +rune_id.split(":")[1]),
      amount: data.children[i].total_amount,
      output: i + 1,
    });
  }
  const mintstone = new Runestone(edicts, none(), none(), none());

  // Add input Rune UTXO
  psbt.addInput({
    hash: data.utxo_txid,
    index: data.utxo_vout,
    witnessUtxo: {
      value: data.utxo_value,
      script: wallet.output,
    },
    tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
  });
  // Add output runestone
  psbt.addOutput({
    script: mintstone.encipher(),
    value: 0,
  });

  // Add output rune utxo
  for (let i = 0; i < data.children.length; i++) {
    psbt.addOutput({
      address: data.children[i].address, // rune receive address
      value: data.children[i].utxo_value,
    });
  }
  // Sign psbt using admin wallet
  const signedPsbt: Bitcoin.Psbt = wallet.signPsbt(psbt, wallet.ecPair);

  // return Virtual Size of Runestone Transaction
  return signedPsbt.extractTransaction(true).toHex();
};
