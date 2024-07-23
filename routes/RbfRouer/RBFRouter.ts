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

RBFRouter.get(
    "/",
    async (req: Request, res: Response) => {
        try {

            const utxos: Array<IUtxo> = [{
                txid: 'dc807ce2d91334232274d488777026013acaff97f95996d1f51c397249d6034c',
                vout: 0,
                value: 4845277
            }]

            const receiveAddress: string = 'tb1ppeacjnf6dmnhejchmlnne4ncm2z7xf447vmruq6htgglz3z55lzsax4mla';
            const originalAddress: string = 'tb1p0ec0c2zjg98q6fcuyrk0tg8xvzaj6ksdndak3ck4wfsr6vufu9ss3z83l4';
            const amount: number = 2000000;

            const feeRate = 2;
            let redeemFee = 1000;

            console.log('redeemfee => ', redeemFee)

            let redeemSignedPsbt: Bitcoin.Psbt = createRBFPsbt(utxos, redeemFee, receiveAddress, originalAddress, amount);

            let realFee: number = redeemSignedPsbt.extractTransaction(true).virtualSize() * feeRate;

            console.log("realfee => ", realFee)

            let realSignedPsbt: Bitcoin.Psbt = RealCreateRBFPsbt(utxos, realFee, receiveAddress, originalAddress, amount)

            console.log(realSignedPsbt.toHex());

            let variable = '70736274ff01008902000000014c03d64972391cf5d19659f997ffca3a0126707788d47422233413d9e27c80dc0000000000ffffffff0280841e00000000002251200e7b894d3a6ee77ccb17dfe73cd678da85e326b5f3363e03575a11f14454a7c529692b00000000002251207e70fc2852414e0d271c20ecf5a0e660bb2d5a0d9b7b68e2d572603d3389e161000000000001012bddee4900000000002251207e70fc2852414e0d271c20ecf5a0e660bb2d5a0d9b7b68e2d572603d3389e16101084201402d64d49017fa1e6acda396010664313e8952510c0e94d4a3b1e3d79f4dc06f1e6379fc0f81b966d367252b3ea40cf3208b1e815a799df77b8f06c2847b293485000000';

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