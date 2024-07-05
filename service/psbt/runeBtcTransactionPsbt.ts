import * as Bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { SEED, TESTNET, networkType } from "../../config/config";
import { IUtxo } from "../../utils/types";
import { RuneId, Runestone, none } from "runelib";
import initializeWallet from "../wallet/initializeWallet";
import { SeedWallet } from "../wallet/SeedWallet";
import app from "../..";
Bitcoin.initEccLib(ecc);

// Create dummy psbt for buyer offer
export const RuneTransferpsbt = async (
  bundledDataArray: Array<any>,
  rune_id: string,
  selectedBtcUtxos: Array<IUtxo>,
  networkType: string,
  runeUtxos: Array<IUtxo>,
  redeemFee: number
): Promise<Bitcoin.Psbt> => {
  // Initialize seed Wallet
  const wallet: SeedWallet = initializeWallet(
    networkType,
    SEED,
    app.locals.walletIndex
  );

  // Create psbt instance
  const psbt = new Bitcoin.Psbt({
    network:
      networkType == TESTNET
        ? Bitcoin.networks.testnet
        : Bitcoin.networks.bitcoin,
  });

  // Input all buyer Rune UTXOs for rune token
  runeUtxos.forEach((utxo) => {
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        value: utxo.value,
        script: wallet.output,
      },
      tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
    });
  });

  // Input all buyer BTC UTXOs for ordinal price
  selectedBtcUtxos.forEach((utxo) => {
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        value: utxo.value,
        script: wallet.output,
      },
      tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
    });
  });

  // Create Runestone
  const edicts: any = [];

  // Complete edicts array
  for (let i = 0; i < bundledDataArray.length; i++) {
    edicts.push({
      id: new RuneId(+rune_id.split(":")[0], +rune_id.split(":")[1]),
      amount: bundledDataArray[i].rune_amount,
      output: i + 2,
    });
  }

  const mintstone = new Runestone(edicts, none(), none(), none());

  // Add output runestone
  psbt.addOutput({
    script: mintstone.encipher(),
    value: 0,
  });

  // Calculate sum of rune utxos array values
  let runeUtxoArraySum = runeUtxos.reduce(
    (accum: number, utxo: IUtxo) => accum + utxo.value,
    0
  );

  // Calculate sum of btc utxos array values
  let selectedBtcUtxosSum = selectedBtcUtxos.reduce(
    (accum: number, utxo: IUtxo) => accum + utxo.value,
    0
  );

  // Calculate sum of output btc utxos array values
  let outputBtcUtxosSum = bundledDataArray.reduce(
    (accum: number, item: any) => accum + item.btc_amount,
    0
  );

  // Add output for change
  psbt.addOutput({
    address: wallet.address,
    value:
      selectedBtcUtxosSum + runeUtxoArraySum - redeemFee - outputBtcUtxosSum,
  });

  // Add output for rune airdrop
  for (let i = 0; i < bundledDataArray.length; i++) {
    psbt.addOutput({
      address: bundledDataArray[i].address,
      value: bundledDataArray[i].btc_amount,
    });
  }
  return psbt;
};
