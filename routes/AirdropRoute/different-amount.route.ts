import { Request, Response, Router } from "express";
import { check, validationResult } from "express-validator";
import { networkType } from "../../config/config";
import * as Bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { createTreeData } from "../../service/tree/createTree";
import { ITreeItem } from "../../utils/types";
import { treeTravelAirdrop } from "../../service/tree/treeTravelAirdrop";
import { sendRuneBtcTransaction } from "../../service/psbt/sendRuneBtcTransaction";
import { pushBTCpmt } from "../../utils/mempool.api";

Bitcoin.initEccLib(ecc);

//create a new instance of the express router
const DifferentAmountRouter = Router();

// @route    POST api/different-amount
// @desc     This endpoint is used to transfer different-amount rune token to different addresses.
// @access   Private

DifferentAmountRouter.post(
  "/different-amount",
  check("rune_id", "Rune Id is required").notEmpty(),
  check("feeRate", "FeeRate is required").notEmpty(),
  check("data", "Data is required").notEmpty(),

  async (req: Request, res: Response) => {
    try {
      // Validate Form Inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(500).json({ error: errors.array() });
      }
      // Getting parameter from request
      const { rune_id, feeRate, data } = req.body;

      // Create tree Data structure
      let treeData: ITreeItem = createTreeData(data, feeRate);

      // log the initial tree data btc utxo, total rune token amount
      console.log("BTC UTXO size => ", treeData.utxo_value);
      console.log("Total Amount => ", treeData.total_amount);

      // Send BTC utxo containing rune token
      const response = await sendRuneBtcTransaction(
        rune_id,
        networkType,
        treeData.total_amount,
        treeData.utxo_value,
        feeRate
      );
      // if creating psbt is failed, return 500 error
      if (!response.isSuccess) {
        return res.status(500).send({ error: response.data });
      }
      // Log transaction Hex
      console.log("Send Fee and UTXO Transaction Hex => ", response.data);

      // broadcast transaction

      // const txid = await pushBTCpmt(response.data, networkType);
      // console.log("Send Fee and UTXO Transaction Id => ", txid);

      // Start Root tour based on recursive function
      let resultData: ITreeItem = treeTravelAirdrop(treeData);

      return res.status(200).send({ data: "test" });
    } catch (error: any) {
      console.log(error.message);
      return res.status(500).send({ error: error });
    }
  }
);

export default DifferentAmountRouter;
