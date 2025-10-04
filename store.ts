'use client';

import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { 
  Owner, 
  Wallet, 
  TokenAsset, 
  NFTAsset, 
  Beneficiary, 
  Assignment, 
  LastWishState 
} from './types';

const defaultState: LastWishState = {
  owner: { fullName: '' },
  wallets: [],
  tokens: [],
  nfts: [],
  beneficiaries: [],
  assignments: [],
};

function loadState(): LastWishState {
  if (typeof window === 'undefined') return defaultState;
  
  try {
    const stored = localStorage.getItem('lastwish');
    return stored ? JSON.parse(stored) : defaultState;
  } catch {
    return defaultState;
  }
}

function saveState(state: LastWishState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lastwish', JSON.stringify(state));
  }
}

interface StoreActions {
  state: LastWishState;
  setOwner: (owner: Partial<Owner>) => void;
  addWallet: (wallet: Partial<Wallet>) => void;
  removeWallet: (id: string) => void;
  addBeneficiary: (beneficiary: Partial<Beneficiary>) => void;
  removeBeneficiary: (id: string) => void;
  updateBeneficiary: (id: string, updates: Partial<Beneficiary>) => void;
  setTokens: (tokens: TokenAsset[]) => void;
  setNfts: (nfts: NFTAsset[]) => void;
  addAssignment: (assignment: Assignment) => void;
  removeAssignment: (assetKey: string) => void;
  updateAssignment: (assetKey: string, assignment: Assignment) => void;
  setPayment: (payment: { txHash?: string }) => void;
  clearState: () => void;
  exportState: () => string;
  importState: (jsonState: string) => void;
}

export const useStore = create<StoreActions>((set, get) => ({
  state: loadState(),

  setOwner: (owner) => set((store) => {
    const newState = {
      ...store.state,
      owner: { ...store.state.owner, ...owner }
    };
    saveState(newState);
    return { state: newState };
  }),

  addWallet: (wallet) => set((store) => {
    const newWallet: Wallet = {
      id: nanoid(),
      address: wallet.address || '',
      ens: wallet.ens,
    };
    const newState = {
      ...store.state,
      wallets: [...store.state.wallets, newWallet]
    };
    saveState(newState);
    return { state: newState };
  }),

  removeWallet: (id) => set((store) => {
    const newState = {
      ...store.state,
      wallets: store.state.wallets.filter(w => w.id !== id)
    };
    saveState(newState);
    return { state: newState };
  }),

  addBeneficiary: (beneficiary) => set((store) => {
    const newBeneficiary: Beneficiary = {
      id: nanoid(),
      name: beneficiary.name || 'Unnamed',
      addressOrEns: beneficiary.addressOrEns,
      email: beneficiary.email,
      relationship: beneficiary.relationship,
    };
    const newState = {
      ...store.state,
      beneficiaries: [...store.state.beneficiaries, newBeneficiary]
    };
    saveState(newState);
    return { state: newState };
  }),

  removeBeneficiary: (id) => set((store) => {
    const newState = {
      ...store.state,
      beneficiaries: store.state.beneficiaries.filter(b => b.id !== id),
      assignments: store.state.assignments.map(a => ({
        ...a,
        splits: a.splits.filter(s => s.beneficiaryId !== id)
      })).filter(a => a.splits.length > 0)
    };
    saveState(newState);
    return { state: newState };
  }),

  updateBeneficiary: (id, updates) => set((store) => {
    const newState = {
      ...store.state,
      beneficiaries: store.state.beneficiaries.map(b => 
        b.id === id ? { ...b, ...updates } : b
      )
    };
    saveState(newState);
    return { state: newState };
  }),

  setTokens: (tokens) => set((store) => {
    const newState = { ...store.state, tokens };
    saveState(newState);
    return { state: newState };
  }),

  setNfts: (nfts) => set((store) => {
    const newState = { ...store.state, nfts };
    saveState(newState);
    return { state: newState };
  }),

  addAssignment: (assignment) => set((store) => {
    const newState = {
      ...store.state,
      assignments: [
        ...store.state.assignments.filter(a => a.assetKey !== assignment.assetKey),
        assignment
      ]
    };
    saveState(newState);
    return { state: newState };
  }),

  removeAssignment: (assetKey) => set((store) => {
    const newState = {
      ...store.state,
      assignments: store.state.assignments.filter(a => a.assetKey !== assetKey)
    };
    saveState(newState);
    return { state: newState };
  }),

  updateAssignment: (assetKey, assignment) => set((store) => {
    const newState = {
      ...store.state,
      assignments: store.state.assignments.map(a => 
        a.assetKey === assetKey ? assignment : a
      )
    };
    saveState(newState);
    return { state: newState };
  }),

  setPayment: (payment) => set((store) => {
    const newState = { ...store.state, payment };
    saveState(newState);
    return { state: newState };
  }),

  clearState: () => set(() => {
    saveState(defaultState);
    return { state: defaultState };
  }),

  exportState: () => {
    return JSON.stringify(get().state, null, 2);
  },

  importState: (jsonState) => set(() => {
    try {
      const importedState = JSON.parse(jsonState);
      saveState(importedState);
      return { state: importedState };
    } catch {
      return { state: get().state };
    }
  }),
}));

