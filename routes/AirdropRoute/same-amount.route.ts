import { Request, Response, Router } from "express";
import { check, validationResult } from "express-validator";
import {
  SEED,
  STANDARD_RUNE_UTXO_VALUE,
  networkType,
} from "../../config/config";
import * as Bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { pushBtcPmt } from "../../utils/unisat.api";
import { sendRuneBtcTransaction } from "../../service/psbt/sendRuneBtcTransaction";
import { calculateRedeemSameAmountTxFee } from "../../service/psbt/redeemSameAmountRunestone";
import { SameRuneTransferTx } from "../../service/psbt/sameRuneTransaction";
import { IUtxo } from "../../utils/types";
import initializeWallet from "../../service/wallet/initializeWallet";
import { SeedWallet } from "../../service/wallet/SeedWallet";
import { pushBTCpmt } from "../../utils/mempool.api";

Bitcoin.initEccLib(ecc);

//create a new instance of the express router
const SameAmountRouter = Router();

// @route    POST api/different-amount
// @desc     This endpoint is used to transfer different-amount rune token to different addresses.
// @access   Private

SameAmountRouter.post(
  "/same-amount",
  check("rune_id", "Rune Id is required").notEmpty(),
  check("feeRate", "FeeRate is required").notEmpty(),
  check("amount", "Amount is required").notEmpty(),
  check("addressList", "AddressList is required").notEmpty(),

  async (req: Request, res: Response) => {
    try {
      // Validate Form Inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(500).json({ error: errors.array() });
      }
      // Getting parameter from request
      const { rune_id, feeRate, amount, addressList } = req.body;

      // calculate utxo size for rune airdrop transaction
      const redeemFee = calculateRedeemSameAmountTxFee(
        rune_id,
        feeRate,
        amount,
        addressList
      );

      // initialize wallet 0 => master wallet
      let wallet: SeedWallet = initializeWallet(networkType, SEED, 0);

      // Calculate required input runeutxo value
      const input_utxo_value: number =
        redeemFee + STANDARD_RUNE_UTXO_VALUE * addressList.length;
      const bundledDataArray = [
        {
          address: wallet.address,
          rune_amount: amount * addressList.length,
          btc_amount: input_utxo_value,
        },
      ];

      // Send BTC utxo containing rune token
      const response = await sendRuneBtcTransaction(
        rune_id,
        networkType,
        bundledDataArray,
        feeRate
      );

      // if creating psbt is failed, return 500 error
      if (!response.isSuccess) {
        return res.status(500).send({ error: response.data });
      }

      ////////////////////////////////////////////////////////////////////////////////
      //
      // broadcast transaction
      const txid: any = await pushBtcPmt(response.data, networkType);
      //
      ////////////////////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////////////////////
      // remove on live version
      // const txid: string =
      //   "5ae028d07b9270cbd60c5f2e8178c8969f9b70a13a30692abf0f85bdf892f9ec";
      //
      ////////////////////////////////////////////////////////////////////////////////

      console.log("Sent Fee and UTXO Transaction => ", txid);

      // Execute Runestone transaction for airdrop with same amount
      const runeUtxo: IUtxo = {
        txid: txid,
        vout: 2,
        value: input_utxo_value,
      };
      const airdropTxHex: string = SameRuneTransferTx(
        addressList,
        amount,
        rune_id,
        networkType,
        runeUtxo
      );

      // broadcast transaction
      const airdropTxid: any = await pushBTCpmt(airdropTxHex, networkType);

      console.log("Airdorp transaction => ", airdropTxid);

      // log the airdrop result
      console.log("Congratulations! Same Amount Runestone airdrop Success!");

      return res.status(200).send({ txid: airdropTxid });
    } catch (error: any) {
      console.log(error.message);
      return res.status(500).send({ error: error });
    }
  }
);

export default SameAmountRouter;
