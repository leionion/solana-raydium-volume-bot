import axios from "axios";
import { TESTNET } from "../config/config";
import dotenv from "dotenv";
import { setUtxoFlag, waitUtxoFlag } from "./mutex";

// Configuration from .env file
dotenv.config();

// Getting blockcypher API array from .env file
const api_key = process.env.BLOCK_CYPHER_API_KEY ?? "";

// Push raw Transaction using blockcypher api key
export const pushRawTransaction = async (
  txHex: string,
  networkType: string
): Promise<any> => {
  try {

    await waitUtxoFlag();

    await setUtxoFlag(1);

    const url = `https://api.blockcypher.com/v1/${networkType == TESTNET ? "btc/test3" : "btc/main"
      }/txs/push?token=${api_key}`;

    const data = {
      tx: txHex,
    };
    let res = await axios.post(url, data);

    await setUtxoFlag(0);

    const txInfo = res.data;

    return txInfo;
  } catch (err: any) {
    console.log(err.response);

    await setUtxoFlag(0);

    console.log("Push Transaction Error");
  }
};
