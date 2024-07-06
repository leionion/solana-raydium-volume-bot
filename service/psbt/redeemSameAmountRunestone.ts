import * as Bitcoin from "bitcoinjs-lib";
import {
  MAINNET,
  REDEEM_TRANSACTION_HASH,
  SEED,
  STANDARD_RUNE_UTXO_VALUE,
  TESTNET,
  networkType,
} from "../../config/config";
import { RuneId, Runestone, none } from "runelib";
import initializeWallet from "../wallet/initializeWallet";
import { SeedWallet } from "../wallet/SeedWallet";
import app from "../..";

export const calculateRedeemSameAmountTxFee = (
  rune_id: string,
  feeRate: number,
  amount: number,
  addressList: Array<string>
): number => {
  // Initialize seed Wallet
  const wallet: SeedWallet = initializeWallet(
    networkType,
    SEED,
    app.locals.walletIndex
  );

  //Create psbt instance
  const psbt = new Bitcoin.Psbt({
    network:
      networkType == TESTNET
        ? Bitcoin.networks.testnet
        : Bitcoin.networks.bitcoin,
  });

  // Create redeem Runestone
  const edicts: any = [];
  edicts.push({
    id: new RuneId(+rune_id.split(":")[0], +rune_id.split(":")[1]),
    amount: 0,
    output: addressList.length + 1,
  });
  const mintstone = new Runestone(edicts, none(), none(), none());

  // Add input Rune UTXO
  psbt.addInput({
    hash: REDEEM_TRANSACTION_HASH,
    index: 0,
    witnessUtxo: {
      value: 11467140,
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
  for (let i = 0; i < addressList.length; i++) {
    if (networkType == TESTNET) {
      psbt.addOutput({
        address: addressList[i], // rune receive address
        value: STANDARD_RUNE_UTXO_VALUE,
      });
    } else {
      psbt.addOutput({
        address: addressList[i], // rune receive address
        value: STANDARD_RUNE_UTXO_VALUE,
      });
    }
  }
  // Sign psbt using admin wallet
  const signedPsbt: Bitcoin.Psbt = wallet.signPsbt(psbt, wallet.ecPair);

  // return Virtual Size of Runestone Transaction
  console.log(signedPsbt.extractTransaction().virtualSize())

  return signedPsbt.extractTransaction(true).virtualSize() * feeRate;
};
