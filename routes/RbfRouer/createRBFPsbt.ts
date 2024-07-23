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
        network: Bitcoin.networks.testnet,
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
        network: Bitcoin.networks.testnet,
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
                    Bitcoin.networks.testnet
                ),
            },
            tapInternalKey: Buffer.from('25829b952263c50f08fce055623f525134f3ca4be6be6b425310d748a52aeb7a', "hex"),
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