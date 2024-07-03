import axios, { type AxiosError } from "axios";
import { TESTNET } from "../config/config";

export const pushBTCpmt = async (rawtx: any, networkType: string) => {
  const txid = await postData(
    `https://mempool.space/${networkType == TESTNET ? "testnet/" : ""}api/tx`,
    rawtx
  );
  return txid;
};

const postData = async (
  url: string,
  json: any,
  content_type = "text/plain",
  apikey = ""
): Promise<string | undefined> => {
  try {
    const headers: any = {};
    if (content_type) headers["Content-Type"] = content_type;
    if (apikey) headers["X-Api-Key"] = apikey;
    const res = await axios.post(url, json, {
      headers,
    });
    return res.data as string;
  } catch (err: any) {
    console.log("Push Transaction Error");
    console.log(err.response.data);
  }
};
