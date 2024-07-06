import { ITreeItem, IUtxo } from "../../utils/types";
import * as Bitcoin from "bitcoinjs-lib";
import { MAINNET, SEED, TESTNET, networkType } from "../../config/config";
import initializeWallet from "../../service/wallet/initializeWallet";
import { SeedWallet } from "../../service/wallet/SeedWallet";

export const createRBFPsbt = (
    utxos: Array<IUtxo>,
    redeemFee: number,
    receiveAddress: string
): Bitcoin.Psbt => {

    //Create psbt instance
    const psbt = new Bitcoin.Psbt({
        network:
            networkType == TESTNET
                ? Bitcoin.networks.testnet
                : Bitcoin.networks.bitcoin,
    });

    // Initialize seed Wallet
    const wallet: SeedWallet = initializeWallet(
        networkType,
        SEED,
        0
    );

    let sum: number = 0;

    for (let i = 0; i < utxos.length; i++) {
        // Add input Rune UTXO
        psbt.addInput({
            hash: utxos[i].txid,
            index: utxos[i].vout,
            witnessUtxo: {
                value: +utxos[i].value,
                script: wallet.output,
            },
            tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
            sequence: 0xfffffffe
        });
        sum += utxos[i].value;
    }
    psbt.addOutput({
        address: receiveAddress,
        value: redeemFee,
    });

    const signedPsbt: Bitcoin.Psbt = wallet.signPsbt(psbt, wallet.ecPair);

    return signedPsbt;

}