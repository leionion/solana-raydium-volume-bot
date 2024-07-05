import { Request, Response, Router } from "express";
import { check, validationResult } from "express-validator";
import { SEED, SPLIT_ADDRESS_SIZE, networkType } from "../../config/config";
import * as Bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { createTreeData } from "../../service/tree/createTree";
import { ITreeItem } from "../../utils/types";
import { treeTravelAirdrop } from "../../service/tree/treeTravelAirdrop";
import { sendRuneBtcTransaction } from "../../service/psbt/sendRuneBtcTransaction";
import { pushBtcPmt } from "../../utils/unisat.api";
import { splitData } from "../../utils/splitArray";
import app from "../..";
import initializeWallet from "../../service/wallet/initializeWallet";
import { SeedWallet } from "../../service/wallet/SeedWallet";
import { pushRawTransaction } from "../../utils/blockcypher.api";

Bitcoin.initEccLib(ecc);

//create a new instance of the express router
const DifferentAmountAirdropRouter = Router();

// @route    POST api/different-amount
// @desc     This endpoint is used to transfer different-amount rune token to different addresses.
// @access   Private

DifferentAmountAirdropRouter.post(
  "/large-different-amount-airdrop",
  check("rune_id", "Rune Id is required").notEmpty(),
  check("feeRate", "FeeRate is required").notEmpty(),
  check("data", "Data is required").notEmpty(),
  check("txid", "TxID is required").notEmpty(),

  async (req: Request, res: Response) => {
    try {
      // Validate Form Inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(500).json({ error: errors.array() });
      }
      // Getting parameter from request
      const { rune_id, feeRate, data, txid
      } = req.body;

      let largeData: Array<any> = [];
      for (let i = 0; i < 12; i++) {
        largeData.push(...data)
      }
      if (largeData.length > SPLIT_ADDRESS_SIZE * 8) {
        return res.status(500).send({ error: `the size of address list is more than ${SPLIT_ADDRESS_SIZE * 8}` })
      }

      // First airdrop from master wallet
      app.locals.walletIndex = 0;
      // Split large address data into smaller data array
      let splitDataArray: Array<any> = splitData(largeData, SPLIT_ADDRESS_SIZE);

      // Array => one item has btc anount, rune token amount
      let bundledDataArray: Array<any> = [];

      // Array => splited treeDataarray
      let treeDataArray: Array<ITreeItem> = [];

      // initialize wallet index global variable
      app.locals.walletIndex = 0;

      for (let i = 0; i < splitDataArray.length; i++) {
        app.locals.walletIndex = i + 1;
        let wallet: SeedWallet = initializeWallet(
          networkType,
          SEED,
          app.locals.walletIndex
        );

        // Create tree Data structure
        let treeData: ITreeItem = createTreeData(splitDataArray[i], feeRate);
        treeDataArray.push(treeData);

        bundledDataArray.push({
          address: wallet.address,
          rune_amount: treeData.total_amount,
          btc_amount: treeData.utxo_value,
        });
      }

      // format wallet index global variable
      app.locals.walletIndex = 0;

      // log the initial tree data btc utxo, total rune token amount
      console.log("bundledDataArray => ", bundledDataArray);

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
      // const txid: any = await pushBtcPmt(response.data, networkType);
      //
      ////////////////////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////////////////////
      // remove on live version
      // txid: string =
      //   "7503d93f8c6a62410ea90a9427519f9907667df5627a3c3cd7dde53d908bbd11";
      //
      ////////////////////////////////////////////////////////////////////////////////

      console.log("Sent Fee and UTXO Transaction => ", txid);

      for (let i = 0; i < bundledDataArray.length; i++) {
        // First airdrop from master wallet
        app.locals.walletIndex = i + 1;

        treeDataArray[i] = {
          ...treeDataArray[i],
          utxo_txid: txid,
          utxo_vout: i + 2,
        };

        // Start Root tour based on recursive function
        let resultData: ITreeItem = await treeTravelAirdrop(
          treeDataArray[i],
          rune_id
        );

        // log the airdrop result
        console.log(
          `Congratulations! Different Amount Runestone airdrop Success - ${i + 1
          } Bunches!`
        );
      }

      // First airdrop from master wallet
      app.locals.walletIndex = 0;

      return res
        .status(200)
        .send("Congratulations! Different Amount Runestone airdrop Success");
    } catch (error: any) {
      console.log(error.message);
      return res.status(500).send({ error: error });
    }
  }
);

export default DifferentAmountAirdropRouter;
