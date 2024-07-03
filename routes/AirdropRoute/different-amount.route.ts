import { Request, Response, Router } from "express";
import { check, validationResult } from "express-validator";
import { TESTNET, networkType } from "../../config/config";
import * as Bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";

Bitcoin.initEccLib(ecc);

//create a new instance of the express router
const DifferentAmountRouter = Router();

// @route    POST api/different-amount
// @desc     New Order
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

      return res.status(200).send({ data: "test" });
    } catch (error: any) {
      console.log(error.message);
      return res.status(500).send({ error: error });
    }
  }
);

export default DifferentAmountRouter;
