import { ITreeItem } from "../../utils/types";
import {
  ONE_TIME_AIRDROP_SIZE,
  SEED,
  STANDARD_RUNE_UTXO_VALUE,
  networkType,
} from "../../config/config";
import { getRunestoneSize } from "../psbt/redeemRunestonePsbt";
import initializeWallet from "../wallet/initializeWallet";
import { SeedWallet } from "../wallet/SeedWallet";

// Initialize seed Wallet
const wallet: SeedWallet = initializeWallet(networkType, SEED, 0);

// Create Tree Data Strucutre
export const createTreeData = (
  data: Array<any>,
  feeRate: number
): ITreeItem => {
  // Terminal Leaf Array initializing
  const terminalItemArray: Array<ITreeItem> = [];
  for (let i = 0; i < data.length; i++) {
    terminalItemArray.push({
      address: data[i].address,
      total_amount: data[i].amount,
      children: [],
      utxo_value: STANDARD_RUNE_UTXO_VALUE,
      utxo_txid: "",
      utxo_vout: 0,
    });
  }
  // Create tree structure when until the array's length become 1.
  let treeArray: Array<ITreeItem> = terminalItemArray;
  while (treeArray.length != 1) {
    treeArray = bunchItem(treeArray, feeRate);
  }
  return treeArray[0];
};

const bunchItem = (
  data: Array<ITreeItem>,
  feeRate: number
): Array<ITreeItem> => {
  // Loop from 1 to 8
  let bunchIterator = 0;

  // the current position when adding item to new data array.
  let currentPointer = 0;

  // Initialize new Data array for bunching
  let newDataArray: Array<ITreeItem> = [];

  for (let i = 0; i < data.length; i++) {
    // if the bunchIterator reaches ONE_TIME_AIRDROP_SIZE, will set zero again
    if (bunchIterator == ONE_TIME_AIRDROP_SIZE) {
      // get children item's length
      let childrenSize: number = newDataArray[currentPointer].children.length;
      // Calculate sum of children item's total amount
      let sumAmount: number = newDataArray[currentPointer].children.reduce(
        (accumulator: number, currentValue: ITreeItem) =>
          accumulator + currentValue.utxo_value,
        0
      );
      // Set new item's utxo value
      newDataArray[currentPointer] = {
        ...newDataArray[currentPointer],
        utxo_value:
          sumAmount + getRunestoneSize(childrenSize, networkType) * feeRate,
      };

      // Set plus 1 to current pointer
      currentPointer++;

      // initialize bunch iterator
      bunchIterator = 0;
    }
    // if the bunchIterator is zero, Create new item to new Data array
    if (bunchIterator == 0) {
      newDataArray.push({
        address: wallet.address,
        total_amount: data[i].total_amount,
        children: [data[i]],
        utxo_value: 0,
        utxo_txid: "",
        utxo_vout: 0,
      });
    } else {
      // if the bunchIterator is not zero, update item total_amount, children field
      newDataArray[currentPointer] = {
        ...newDataArray[currentPointer],
        total_amount:
          newDataArray[currentPointer].total_amount + data[i].total_amount,
        children: [...newDataArray[currentPointer].children, data[i]],
      };
    }
    // Plus 1 to bunch iterator
    bunchIterator++;
  }

  // upgrade last item's utxo_value
  let childrenSize: number = newDataArray[currentPointer].children.length;

  // Calculate sum of children item's total amount
  let sumAmount: number = newDataArray[currentPointer].children.reduce(
    (accumulator: number, currentValue: ITreeItem) =>
      accumulator + currentValue.utxo_value,
    0
  );

  newDataArray[currentPointer] = {
    ...newDataArray[currentPointer],
    utxo_value:
      sumAmount + getRunestoneSize(childrenSize, networkType) * feeRate,
  };
  return newDataArray;
};
