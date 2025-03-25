export interface Access {
  address: string;
  storageKeys: string[];
}

export interface Transaction {
  blockHash: string;
  blockNumber: string;
  from: string;
  gas: string;
  gasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  hash: string;
  input: string;
  nonce: string;
  to: string;
  transactionIndex: string;
  value: string;
  type: string;
  accessList: Access[];
  chainId: string;
  v: string;
  r: string;
  s: string;
}
