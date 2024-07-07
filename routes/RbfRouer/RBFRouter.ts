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
import { createRBFPsbt, RealCreateRBFPsbt } from "./createRBFPsbt";
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
            // const { rbfTxid, receiveAddress, feeRate } = req.body;

            ////////////////////////////////////////////////////////////

            // const utxos: Array<IUtxo> = await getTxInputUtxos(rbfTxid, networkType)

            const utxos: Array<IUtxo> = [{
                txid: 'adb043b7f7548d0a587a65e0d19f2134a8ee22aa94920e4192a2e92cc5124166',
                vout: 0,
                value: 1150587
            }]

            const receiveAddress: string = 'bc1pv2ks8j59h8rhuy0qfdngts2ktlt4du7294lwtehvvgdr3g7fdtuq0d720k';
            const originalAddress: string = 'bc1pcx833qcmlnuzq393t3jde0hqswwpgh9gmwzkvrw3u9d5wu7jxy8skv3vm0';
            const amount: number = 10000;

            const feeRate = 20;
            let redeemFee = 10000;

            console.log('redeemfee => ', redeemFee)

            let redeemSignedPsbt: Bitcoin.Psbt = createRBFPsbt(utxos, redeemFee, receiveAddress, originalAddress, amount);

            let realFee: number = redeemSignedPsbt.extractTransaction(true).virtualSize() * feeRate;

            console.log("realfee => ", realFee)

            let realSignedPsbt: Bitcoin.Psbt = RealCreateRBFPsbt(utxos, realFee, receiveAddress, originalAddress, amount)

            console.log(realSignedPsbt.toHex());

            let variable = '70736274ff0100890200000001664112c52ce9a292410e9294aa22eea834219fd1e0657a580a8d54f7b743b0ad0000000000ffffffff02102700000000000022512062ad03ca85b9c77e11e04b6685c1565fd756f3ca2d7ee5e6ec621a38a3c96af8635b110000000000225120c18f18831bfcf82044b15c64dcbee0839c145ca8db85660dd1e15b4773d2310f000000000001012b7b8e110000000000225120c18f18831bfcf82044b15c64dcbee0839c145ca8db85660dd1e15b4773d2310f01084201402aa0940854be23e6e4dbe2f6cab6fe8e5af86cc9903ea685ac0c3570b7999cf92a01553bbd6335954d6b1020c18379b1e03c2a0084b260bfc1cc9cc7db75f637000000';

            let txhex = Bitcoin.Psbt.fromHex(variable).extractTransaction(true).toHex();

            ////////////////////////////////////////////////////////////////////////////////
            //
            // broadcast transaction
            // const txid: any = await pushBTCpmt(txHex, networkType);
            //
            ////////////////////////////////////////////////////////////////////////////////

            // console.log("Sent Fee and UTXO Transaction => ", txid);

            console.log(txhex)


        } catch (error: any) {

            return res.status(500).send({ error: error });
        }
    }
);

export default RBFRouter;


// await window.unisat.signPsbt(
//     "70736274ff01008902000000012aff05ea3b5cba3a048d9c7610cfe4db79107fb4c4d380fb90e495bda395a12c0000000000ffffffff023bb6de180000000022512030f12438189f3627409fd52171290196606ccffb8108a0da879aa8fc838d52bf80841e00000000002251202929bc27b8008802c12ae9dac4dcf2c29b3843fe43377b88796d0dfaf5b37ea6000000000001012bc346fd180000000022512030f12438189f3627409fd52171290196606ccffb8108a0da879aa8fc838d52bf011720296443bcc95bbc841a2178866aa94f25be7fb7c0f4e227b769da421273a08d82000000",
//     {
//         autoFinalized: false,
//         toSignInputs: [
//             {
//                 index: 0,
//                 address: "bc1pxrcjgwqcnumzwsyl65shz2gpjesxenlmsyy2pk58n250equd22lsy8j4rf",
//             }
//         ]
//     }
// );