import { Request, Response, Router } from "express";
import {
  TESTNET,
  networkType,
  ONE_TIME_AIRDROP_SIZE,
  MAINNET,
} from "../../config/config";

import * as Bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { getRunestoneSize } from "../../service/psbt/redeemRunestonePsbt";

Bitcoin.initEccLib(ecc);

//create a new instance of the express router
const RedeemRunestoneFeeRouter = Router();

// @route    POST api/runestone-fee
// @desc     New Order
// @access   Private

RedeemRunestoneFeeRouter.get(
  "/runestone-fee",

  async (req: Request, res: Response) => {
    try {
      // Initialize TransactionSizeArray
      let txSizeArray: Array<number> = [];

      // Select network type
      if (networkType == TESTNET) {
        for (let i = 0; i < ONE_TIME_AIRDROP_SIZE; i++) {
          //iterator from 1 to 8
          txSizeArray.push(getRunestoneSize(i + 1, TESTNET));
        }
      } else {
        for (let i = 0; i < ONE_TIME_AIRDROP_SIZE; i++) {
          //iterator from 1 to 8
          txSizeArray.push(getRunestoneSize(i + 1, MAINNET));
        }
      }

      return res.status(200).send({ data: txSizeArray });
    } catch (error: any) {
      console.log(error.message);
      return res.status(500).send({ error: error });
    }
  }
);

export default RedeemRunestoneFeeRouter;
