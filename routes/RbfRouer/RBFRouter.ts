import { Request, Response, Router } from "express";
import { check, validationResult } from "express-validator";
import {
    SEED,
    STANDARD_RUNE_UTXO_VALUE,
    networkType,
} from "../../config/config";
import * as Bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { SameRuneTransferTx } from "../../service/psbt/sameRuneTransaction";
import { IUtxo } from "../../utils/types";
import { pushBTCpmt } from "../../utils/mempool.api";
import { createRBFPsbt } from "./createRBFPsbt";
import { getTxInputUtxos } from "../../utils/unisat.api";

Bitcoin.initEccLib(ecc);

//create a new instance of the express router
const RBFRouter = Router();

// @route    POST api/different-amount
// @desc     This endpoint is used to transfer different-amount rune token to different addresses.
// @access   Private

RBFRouter.post(
    "/",
    async (req: Request, res: Response) => {
        try {
            const { rbfTxid, receiveAddress, feeRate } = req.body;
            ////////////////////////////////////////////////////////////

            const utxos: Array<IUtxo> = await getTxInputUtxos(rbfTxid, networkType)

            let redeemFee = 100000;

            console.log('redeemfee => ', redeemFee)

            let redeemSignedPsbt: Bitcoin.Psbt = createRBFPsbt(utxos, redeemFee, receiveAddress)

            let realFee: number = redeemSignedPsbt.extractTransaction(true).virtualSize() * feeRate;

            console.log("realfee => ", realFee)

            let realSignedPsbt: Bitcoin.Psbt = createRBFPsbt(utxos, realFee, receiveAddress)

            let txHex: string = realSignedPsbt.extractTransaction(true).toHex();

            ////////////////////////////////////////////////////////////////////////////////
            //
            // broadcast transaction
            const txid: any = await pushBTCpmt(txHex, networkType);
            //
            ////////////////////////////////////////////////////////////////////////////////

            console.log("Sent Fee and UTXO Transaction => ", txid);

            return res.status(200).send({ txid: txid });

        } catch (error: any) {

            return res.status(500).send({ error: error });
        }
    }
);

export default RBFRouter;
