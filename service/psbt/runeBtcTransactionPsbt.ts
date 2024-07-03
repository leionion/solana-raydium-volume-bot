import * as Bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { TESTNET } from "../../config/config";
import wallet from "../wallet/initializeWallet";
import { IUtxo } from "../../utils/types";
import { RuneId, Runestone, none } from "runelib";
Bitcoin.initEccLib(ecc);

// Create dummy psbt for buyer offer
export const RuneTransferpsbt = async (
  total_amount: number,
  utxo_value: number,
  rune_id: string,
  selectedBtcUtxos: Array<IUtxo>,
  networkType: string,
  runeUtxos: Array<IUtxo>,
  redeemFee: number
): Promise<Bitcoin.Psbt> => {
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
  edicts.push({
    id: new RuneId(+rune_id.split(":")[0], +rune_id.split(":")[1]),
    amount: total_amount,
    output: 2,
  });
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

  // Add output for change
  psbt.addOutput({
    address: wallet.address,
    value: selectedBtcUtxosSum + runeUtxoArraySum - redeemFee - utxo_value,
  });

  // Add output for rune airdrop
  psbt.addOutput({
    address: wallet.address,
    value: utxo_value,
  });

  return psbt;
};
