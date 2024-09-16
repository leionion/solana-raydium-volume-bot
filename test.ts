import { Connection, PublicKey } from "@solana/web3.js";
import { retrieveEnvVariable, sleep } from "./src/utils";

const rpcUrl = retrieveEnvVariable("RPC_URL");
const connection = new Connection(rpcUrl, { commitment: "confirmed" });


const main = async () => {
  const signatures = await connection.getSignaturesForAddress(new PublicKey("BgaaTbMTS9avcgFjbyZ2J8xyUt3DJ1vEL9jNZoestW7u"))
  console.log(signatures.length, " signatures")
  const data = signatures.map(async (sig, i) => {
    await sleep(2 * i)
    const data = await connection.getParsedTransaction(sig.signature, {commitment: "confirmed", maxSupportedTransactionVersion: 0})
    console.log(data?.blockTime)
    return data
  })
  console.log(data.length)
}

main().catch(e => console.log(e))