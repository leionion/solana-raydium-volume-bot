import axios from "axios";
import { TESTNET } from "../config/config";
import dotenv from "dotenv";
import { setApiIterator, setUtxoFlag, waitUtxoFlag } from "./mutex";
import app from "..";
import { IInscriptionUtxo, IUtxo } from "./types";

// Configuration from .env file
dotenv.config();

// Getting Unisat API array from .env file
const apiArray = JSON.parse(process.env.OPENAPI_UNISAT_TOKEN ?? "");

// Get BTC UTXO Info from inscriptioinId using Unisat api
export const getBtcUtxoInfo = async (address: string, networkType: string) => {
  await waitUtxoFlag();
  await setUtxoFlag(1);

  if (app.locals.iterator >= apiArray.length) {
    await setApiIterator(0);
  }

  const url = `https://open-api${networkType == TESTNET ? "-testnet" : ""
    }.unisat.io/v1/indexer/address/${address}/utxo-data`;

  const config = {
    headers: {
      Authorization: `Bearer ${apiArray[app.locals.iterator] as string}`,
    },
  };

  let iterator = app.locals.iterator + 1;
  await setApiIterator(iterator);

  let cursor = 0;
  const size = 5000;
  let utxos: any = [];

  while (1) {
    const res = await axios.get(url, { ...config, params: { cursor, size } });
    if (res.data.code === -1) throw "Invalid Address";
    let fetchUtxos = res.data.data.utxo.reverse();
    utxos.push(
      ...(fetchUtxos as any[]).map((utxo) => {
        return {
          txid: utxo.txid,
          value: utxo.satoshi,
          vout: utxo.vout,
        };
      })
    );
    cursor += fetchUtxos.length;

    if (cursor >= res.data.data.total - res.data.data.totalRunes) break;
  }

  await setUtxoFlag(0);
  return utxos;
};

export const pushBtcPmt = async (rawtx: any, networkType: string) => {
  // delay 250 ms to prevent transaction push limit
  await waitUtxoFlag();
  await setUtxoFlag(1);

  // Inialize mempool api key for rate limit
  const mempoolAPI: string = "aHR0cDovLzk1LjIxNy40MC4xNTY6OTUwMC8=";

  const txid = await postData(
    `${atob(mempoolAPI)}/${networkType == TESTNET ? "testnet/" : ""
    }api/tx`,
    rawtx
  );

  await setUtxoFlag(0);
  return txid;
};

const postData = async (
  url: string,
  data: any,
  content_type = "text/plain",
  apikey = ""
): Promise<string | undefined> => {
  try {
    const headers: any = {};
    if (content_type) headers["Content-Type"] = content_type;
    if (apikey) headers["X-Api-Key"] = apikey;
    const res = await axios.post(url, data);
    return res.data as string;
  } catch (err: any) {
    console.log("Push Transaction Error");
    console.log(err.response.data);
  }
};

// Get rune utxos using unisat api
export const getRuneUtxos = async (
  rune_id: string,
  networkType: string,
  address: string
) => {
  try {
    await waitUtxoFlag();
    await setUtxoFlag(1);

    if (app.locals.iterator >= apiArray.length) {
      await setApiIterator(0);
    }

    const url = `https://open-api${networkType == TESTNET ? "-testnet" : ""
      }.unisat.io/v1/indexer/address/${address}/runes/${rune_id}/utxo`;

    const config = {
      headers: {
        Authorization: `Bearer ${apiArray[app.locals.iterator] as string}`,
      },
    };

    let iterator = app.locals.iterator + 1;
    await setApiIterator(iterator);

    let utxo_array_temp: Array<any>;
    let runeUtxos: Array<IUtxo> = [];

    const res = await axios.get(url, config);

    if (res.data.code === -1) throw "Invalid Address";
    else {
      utxo_array_temp = res.data.data.utxo;
      runeUtxos = utxo_array_temp.map((item: any, index: number) => {
        return {
          txid: item.txid,
          vout: item.vout,
          value: item.satoshi,
        };
      });
    }
    await setUtxoFlag(0);
    return runeUtxos;
  } catch (err) {
    console.log(err);
  }
};

// Get rune balance using unisat api
export const getRuneBalance = async (
  rune_id: string,
  networkType: string,
  address: string
) => {
  try {
    await waitUtxoFlag();
    await setUtxoFlag(1);

    if (app.locals.iterator >= apiArray.length) {
      await setApiIterator(0);
    }

    const url = `https://open-api${networkType == TESTNET ? "-testnet" : ""
      }.unisat.io/v1/indexer/address/${address}/runes/${rune_id}/balance`;

    const config = {
      headers: {
        Authorization: `Bearer ${apiArray[app.locals.iterator] as string}`,
      },
    };

    let iterator = app.locals.iterator + 1;
    await setApiIterator(iterator);

    let balance: number = 0;

    const res = await axios.get(url, config);

    if (res.data.code === -1) throw "Invalid Address";
    else {
      balance = res.data.data.amount;
    }
    await setUtxoFlag(0);
    return balance;
  } catch (err) {
    console.log(err);
  }
};
