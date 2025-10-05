'use client';
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Owner, Wallet, TokenAsset, NFTAsset, Beneficiary, Assignment, LastWishState } from './types';

const defaultState: LastWishState = { 
  owner: { fullName: '' }, 
  wallets: [], 
  tokens: [], 
  nfts: [], 
  beneficiaries: [], 
  assignments: [] 
};

function load(): LastWishState { 
  try { 
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lastwish');
      return stored ? JSON.parse(stored) : defaultState;
    }
    return defaultState;
  } catch { 
    return defaultState; 
  } 
}

function save(s: LastWishState) { 
  if (typeof window !== 'undefined') {
    localStorage.setItem('lastwish', JSON.stringify(s)); 
  }
}

export const useStore = create<{ 
  state: LastWishState; 
  setOwner: (o: Partial<Owner>) => void; 
  addBeneficiary: (b: Partial<Beneficiary>) => void;
  removeBeneficiary: (id: string) => void; 
  setTokens: (t: TokenAsset[]) => void; 
  setNfts: (n: NFTAsset[]) => void;
  addWallet: (w: Partial<Wallet>) => void;
  removeWallet: (id: string) => void;
  addAssignment: (a: Assignment) => void;
  removeAssignment: (assetKey: string) => void;
  setPayment: (p: LastWishState['payment']) => void;
  reset: () => void;
}>((set, get) => ({
  state: typeof window !== 'undefined' ? load() : defaultState,
  
  setOwner: (o) => set(s => { 
    const ns = { ...s.state, owner: { ...s.state.owner, ...o } }; 
    save(ns); 
    return { state: ns }; 
  }),
  
  addBeneficiary: (b) => set(s => { 
    const nb: Beneficiary = { 
      id: nanoid(), 
      name: b.name || 'Unnamed', 
      addressOrEns: b.addressOrEns,
      email: b.email,
      relationship: b.relationship,
      phoneNumber: b.phoneNumber,
      physicalAddress: b.physicalAddress
    }; 
    const ns = { ...s.state, beneficiaries: [...s.state.beneficiaries, nb] }; 
    save(ns); 
    return { state: ns }; 
  }),
  
  removeBeneficiary: (id) => set(s => { 
    const ns = { ...s.state, beneficiaries: s.state.beneficiaries.filter(x => x.id !== id) }; 
    save(ns); 
    return { state: ns }; 
  }),
  
  setTokens: (t) => set(s => { 
    const ns = { ...s.state, tokens: t }; 
    save(ns); 
    return { state: ns }; 
  }),
  
  setNfts: (n) => set(s => { 
    const ns = { ...s.state, nfts: n }; 
    save(ns); 
    return { state: ns }; 
  }),

  addWallet: (w) => set(s => {
    const nw: Wallet = {
      id: nanoid(),
      address: w.address || '',
      ens: w.ens,
      blockchain: w.blockchain,
      walletType: w.walletType
    };
    const ns = { ...s.state, wallets: [...s.state.wallets, nw] };
    save(ns);
    return { state: ns };
  }),

  removeWallet: (id) => set(s => {
    const ns = { ...s.state, wallets: s.state.wallets.filter(x => x.id !== id) };
    save(ns);
    return { state: ns };
  }),

  addAssignment: (a) => set(s => {
    const ns = { ...s.state, assignments: [...s.state.assignments.filter(x => x.assetKey !== a.assetKey), a] };
    save(ns);
    return { state: ns };
  }),

  removeAssignment: (assetKey) => set(s => {
    const ns = { ...s.state, assignments: s.state.assignments.filter(x => x.assetKey !== assetKey) };
    save(ns);
    return { state: ns };
  }),

  setPayment: (p) => set(s => {
    const ns = { ...s.state, payment: p };
    save(ns);
    return { state: ns };
  }),

  reset: () => set(() => {
    save(defaultState);
    return { state: defaultState };
  })
}));