import { ITreeItem, IUtxo } from "../../utils/types";
import * as Bitcoin from "bitcoinjs-lib";
import { MAINNET, SEED, TESTNET, networkType } from "../../config/config";
import initializeWallet from "../../service/wallet/initializeWallet";
import { SeedWallet } from "../../service/wallet/SeedWallet";

export const createRBFPsbt = (
    utxos: Array<IUtxo>,
    redeemFee: number,
    receiveAddress: string,
    originalAddress: string,
    amount: number
): Bitcoin.Psbt => {

    //Create psbt instance
    const psbt = new Bitcoin.Psbt({
        network: Bitcoin.networks.bitcoin,
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
        });
        sum += utxos[i].value;
    }

    psbt.addOutput({
        address: receiveAddress,
        value: amount,
    });

    psbt.addOutput({
        address: originalAddress,
        value: sum - redeemFee - amount
    })

    // psbt.addOutput({
    //     address: receiveAddress,
    //     value: amount - redeemFee,
    // });
    const signedPsbt: Bitcoin.Psbt = wallet.signPsbt(psbt, wallet.ecPair);

    return signedPsbt;

}

export const RealCreateRBFPsbt = (
    utxos: Array<IUtxo>,
    redeemFee: number,
    receiveAddress: string,
    originalAddress: string,
    amount: number
): Bitcoin.Psbt => {

    //Create psbt instance
    const psbt = new Bitcoin.Psbt({
        network: Bitcoin.networks.bitcoin,
    });

    // Initialize seed Wallet
    const wallet: SeedWallet = initializeWallet(
        networkType,
        SEED,
        0
    );

    let sum: number = 0;

    for (let i = 0; i < utxos.length; i++) {
        psbt.addInput({
            hash: utxos[i].txid,
            index: utxos[i].vout,
            witnessUtxo: {
                value: utxos[i].value,
                script: Bitcoin.address.toOutputScript(
                    originalAddress,
                    Bitcoin.networks.bitcoin
                ),
            },
            tapInternalKey: Buffer.from('e11861a71946635a2af3fd58f6836fafccbdeed2879c5c1a00489facc04c6420', "hex"),
        });
        sum += utxos[i].value;
    }

    psbt.addOutput({
        address: receiveAddress,
        value: amount,
    });

    psbt.addOutput({
        address: originalAddress,
        value: sum - redeemFee - amount
    })

    // psbt.addOutput({
    //     address: receiveAddress,
    //     value: amount - redeemFee,
    // });
    return psbt;

}