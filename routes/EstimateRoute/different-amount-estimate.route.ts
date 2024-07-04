import { Request, Response, Router } from "express";
import { check, validationResult } from "express-validator";
import {
  MAINNET_REDEEM_ADDRESS,
  TESTNET,
  TESTNET_REDEEM_ADDRESS,
  networkType,
} from "../../config/config";
import * as Bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { createTreeData } from "../../service/tree/createTree";
import { ITreeItem } from "../../utils/types";

Bitcoin.initEccLib(ecc);

//create a new instance of the express router
const EstimateDifferentAmountRouter = Router();

// @route    POST api/different-amount
// @desc     This endpoint is used to transfer different-amount rune token to different addresses.
// @access   Private

EstimateDifferentAmountRouter.post(
  "/different-amount",
  check("feeRate", "FeeRate is required").notEmpty(),
  check("size", "Size is required").notEmpty(),

  async (req: Request, res: Response) => {
    try {
      // Validate Form Inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(500).json({ error: errors.array() });
      }
      // Getting parameter from request
      const { feeRate, size } = req.body;

      // Create dummy data based on size
      let data: Array<any> = [];
      let redeemAddress: string = "";

      if (networkType == TESTNET) {
        redeemAddress = TESTNET_REDEEM_ADDRESS;
      } else {
        redeemAddress = MAINNET_REDEEM_ADDRESS;
      }

      for (let i = 0; i < size; i++) {
        if (networkType == TESTNET)
          data.push({
            address: redeemAddress,
            amount: 1,
          });
      }

      // Create tree Data structure
      let treeData: ITreeItem = createTreeData(data, feeRate);

      // log the initial tree data btc utxo
      console.log("BTC UTXO size => ", treeData.utxo_value);

      return res.status(200).send({
        fee: treeData.utxo_value,
      });
    } catch (error: any) {
      console.log(error.message);
      return res.status(500).send({ error: error });
    }
  }
);

export default EstimateDifferentAmountRouter;
