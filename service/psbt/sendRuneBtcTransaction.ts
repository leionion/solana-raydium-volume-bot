import { Psbt } from "bitcoinjs-lib";
import { SEED, SEND_UTXO_FEE_LIMIT, networkType } from "../../config/config";
import { IUtxo } from "../../utils/types";
import {
  getBtcUtxoInfo,
  getRuneUtxos,
  getRuneBalance,
} from "../../utils/unisat.api";
import { getSendBTCUTXOArray } from "../utxo/utxo.management";
import { RuneTransferpsbt } from "./runeBtcTransactionPsbt";
import initializeWallet from "../wallet/initializeWallet";
import { SeedWallet } from "../wallet/SeedWallet";
import app from "../..";

export const sendRuneBtcTransaction = async (
  rune_id: string,
  networkType: string,
  bundledDataArray: Array<any>,
  feeRate: number
): Promise<any> => {
  // Initialize seed Wallet
  const wallet: SeedWallet = initializeWallet(
    networkType,
    SEED,
    app.locals.walletIndex
  );

  //get rune balance of admin wallet

  const rune_balance: any = await getRuneBalance(
    rune_id,
    networkType,
    wallet.address
  );

  // Sum of required Rune amount values
  let runeTokenAmountArraySum = bundledDataArray.reduce(
    (accum: number, item: any) => accum + item.rune_amount,
    0
  );

  //Check rune token is enough
  if (+rune_balance < runeTokenAmountArraySum) {
    return { isSuccess: false, data: `No enough rune balance for ${rune_id}` };
  }

  // Sum of required BTC amount values
  let btcAmountArraySum = bundledDataArray.reduce(
    (accum: number, item: any) => accum + item.btc_amount,
    0
  );

  // Get rune utxos of admin wallet
  let runeUtxosTemp: any = await getRuneUtxos(
    rune_id,
    networkType,
    wallet.address
  );
  let runeUtxos: Array<IUtxo> = runeUtxosTemp;

  // Get btc utxos of admin wallet
  let btcUtxos: any = await getBtcUtxoInfo(wallet.address, networkType);

  btcUtxos = btcUtxos.filter(
    (item: IUtxo, index: number) =>
      item.value >= 10000 &&
      runeUtxos.find(
        (runeItem: IUtxo) =>
          runeItem.txid == item.txid && runeItem.vout == item.vout
      ) == undefined
  );

  // Calculate sum of rune utxos array values
  let runeUtxoArraySum = runeUtxos.reduce(
    (accum: number, utxo: IUtxo) => accum + utxo.value,
    0
  );

  // get initially selected utxo array
  let response = getSendBTCUTXOArray(
    btcUtxos,
    btcAmountArraySum + SEND_UTXO_FEE_LIMIT - runeUtxoArraySum
  );

  // check the btc balance is enough
  if (!response.isSuccess) {
    return { isSuccess: false, data: "Not enough balance on your wallet." };
  }

  // loop calculate fee using dummy transaction
  let selectedBtcUtxos = response.data;
  let redeemFee = SEND_UTXO_FEE_LIMIT;

  for (let i = 0; i < 3; i++) {
    //loop for exact calculation fee
    let redeemPsbt: Psbt = await RuneTransferpsbt(
      bundledDataArray,
      rune_id,
      selectedBtcUtxos,
      networkType,
      runeUtxos,
      redeemFee
    );

    // Sign redeem psbt
    redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair);
    // Calculate redeem fee
    redeemFee = redeemPsbt.extractTransaction(true).virtualSize() * feeRate;

    // update selectedBtcUtxo array
    response = getSendBTCUTXOArray(
      btcUtxos,
      btcAmountArraySum + redeemFee - runeUtxoArraySum
    );

    if (!response.isSuccess) {
      return { isSuccess: false, data: "Not enough balance in your wallet." };
    }
    selectedBtcUtxos = response.data;
  }

  // Create real psbt
  let realPsbt: Psbt = await RuneTransferpsbt(
    bundledDataArray,
    rune_id,
    selectedBtcUtxos,
    networkType,
    runeUtxos,
    redeemFee
  );

  // Sign real psbt
  realPsbt = wallet.signPsbt(realPsbt, wallet.ecPair);

  // Calculate real transaction fee
  const txHex: string = realPsbt.extractTransaction(true).toHex();

  return { isSuccess: true, data: txHex };
};
