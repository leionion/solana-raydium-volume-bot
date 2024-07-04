import * as Bitcoin from "bitcoinjs-lib";
import {
  MAINNET,
  REDEEM_TRANSACTION_HASH,
  STANDARD_RUNE_UTXO_VALUE,
  TESTNET,
  networkType,
} from "../../config/config";
import wallet from "../wallet/initializeWallet";
import { RuneId, Runestone, none } from "runelib";

export const calculateRedeemSameAmountTxFee = (
  rune_id: string,
  feeRate: number,
  amount: number,
  addressList: Array<string>
): number => {
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
      value: 100000,
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
        address:
          "tb1pjzwn9z0q39y45adgsscy5q4mrl0wrav47lemwvk83gnjtwv3dggqzlgdsl", // rune receive address
        value: STANDARD_RUNE_UTXO_VALUE,
      });
    } else {
      psbt.addOutput({
        address:
          "bc1p0sd5xq6sz0eg3r9j5df0qk38pgnuqreav2qqtq5jfvwpk3yhzuxq9vaygt", // rune receive address
        value: STANDARD_RUNE_UTXO_VALUE,
      });
    }
  }
  // Sign psbt using admin wallet
  const signedPsbt: Bitcoin.Psbt = wallet.signPsbt(psbt, wallet.ecPair);

  // return Virtual Size of Runestone Transaction
  return signedPsbt.extractTransaction(true).virtualSize() * feeRate;
};
