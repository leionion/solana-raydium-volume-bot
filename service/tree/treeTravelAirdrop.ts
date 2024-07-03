import { ITreeItem } from "../../utils/types";

export const treeTravelAirdrop = (data: ITreeItem): ITreeItem => {
  if (data.children.length == 0) {
    return data;
  } else {
    for (let i = 0; i < data.children.length; i++) {
      // implementation to create/broadcast transaction, will update the children's utxo data
      // create transaction

      ///////////////////////////////////////////////////////////
      //
      ///////////////////////////////////////////////////////////

      // broadcast transaction
      // update child item's utxo_txid, utxo_vout field
      data.children[i].utxo_txid = "test_txid";
      data.children[i].utxo_vout = 123;
    }
    // initialize new updated Children array
    let updatedChildrenData: Array<ITreeItem> = [];

    // Loop the recursive function
    for (let i = 0; i < data.children.length; i++) {
      // Push new updated item to the instance array
      updatedChildrenData.push(treeTravelAirdrop(data.children[i]));
    }
    return {
      ...data,
      children: updatedChildrenData,
    };
  }
};
