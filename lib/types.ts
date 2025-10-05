export type Owner = {
  fullName: string;
  primaryWallet?: string;
  specialInstructions?: string;
};

export type Wallet = { 
  id: string; 
  address: string; 
  ens?: string;
  blockchain?: string;
  walletType?: string;
};

export type TokenAsset = {
  chainId: number; 
  address: string; 
  symbol: string; 
  decimals: number; 
  balance: string;
  name?: string;
  valueUsd?: number;
};

export type NFTAsset = {
  chainId: number; 
  contract: string; 
  tokenId: string; 
  collection?: string;
  name?: string;
  image?: string;
};

export type Beneficiary = {
  id: string; 
  name: string; 
  addressOrEns?: string; 
  email?: string;
  relationship?: string;
  phoneNumber?: string;
  physicalAddress?: string;
};

export type Assignment = {
  assetKey: string; // e.g., "erc20:1:0x..." or "nft:1:0x...:1234"
  splits: Array<{ beneficiaryId: string; pct: number }>; // validate to 100
};

export type LastWishState = {
  owner: Owner; 
  wallets: Wallet[]; 
  tokens: TokenAsset[]; 
  nfts: NFTAsset[];
  beneficiaries: Beneficiary[]; 
  assignments: Assignment[]; 
  payment?: { 
    txHash?: string;
    confirmed?: boolean;
    amount?: number;
  };
};