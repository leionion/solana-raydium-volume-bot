export interface IUtxo {
  txid: string;
  vout: number;
  value: number;
}

export interface IInscriptionUtxo {
  txid: string;
  vout: number;
  value: number;
  address: string;
}

// Initialize tree element file type
export interface ITreeItem {
  address: string;
  total_amount: number;
  children: Array<ITreeItem>;
  utxo_value: number;
  utxo_txid: string;
  utxo_vout: number;
}
