import { openDB, DBSchema, IDBPDatabase } from 'idb'

// Database schema for IndexedDB
interface LastWishDB extends DBSchema {
  estates: {
    key: string
    value: EstateData
  }
  beneficiaries: {
    key: string
    value: BeneficiaryData
  }
  wallets: {
    key: string
    value: WalletData
  }
  documents: {
    key: string
    value: DocumentData
  }
}

// Data types
export interface EstateData {
  id: string
  userId: string
  title: string
  createdAt: Date
  updatedAt: Date
  assets: DigitalAsset[]
  beneficiaries: BeneficiaryData[]
  instructions: string
  state: string
  status: 'draft' | 'completed' | 'archived'
}

export interface DigitalAsset {
  id: string
  type: 'cryptocurrency' | 'nft' | 'defi' | 'other'
  blockchain: string
  contractAddress?: string
  tokenId?: string
  walletAddress: string
  symbol: string
  name: string
  balance: string
  estimatedValue: number
  accessInstructions: string
}

export interface BeneficiaryData {
  id: string
  name: string
  email: string
  relationship: string
  allocation: number // percentage
  accessLevel: 'full' | 'limited' | 'view-only'
  contactInfo: {
    phone?: string
    address?: string
    ensName?: string
  }
}

export interface WalletData {
  id: string
  address: string
  blockchain: string
  connectedAt: Date
  lastSyncAt: Date
  assets: DigitalAsset[]
}

export interface DocumentData {
  id: string
  estateId: string
  type: 'will' | 'trust' | 'poa' | 'beneficiary-designation'
  content: string
  pdfData?: Blob
  createdAt: Date
  status: 'draft' | 'generated' | 'signed'
}

class ClientStorage {
  private db: IDBPDatabase<LastWishDB> | null = null

  async init() {
    if (this.db) return this.db

    this.db = await openDB<LastWishDB>('lastwish', 1, {
      upgrade(db) {
        // Create estates store
        if (!db.objectStoreNames.contains('estates')) {
          const estateStore = db.createObjectStore('estates', { keyPath: 'id' })
          estateStore.createIndex('userId', 'userId')
          estateStore.createIndex('status', 'status')
        }

        // Create beneficiaries store
        if (!db.objectStoreNames.contains('beneficiaries')) {
          const beneficiaryStore = db.createObjectStore('beneficiaries', { keyPath: 'id' })
          beneficiaryStore.createIndex('estateId', 'estateId')
        }

        // Create wallets store
        if (!db.objectStoreNames.contains('wallets')) {
          const walletStore = db.createObjectStore('wallets', { keyPath: 'id' })
          walletStore.createIndex('address', 'address')
          walletStore.createIndex('blockchain', 'blockchain')
        }

        // Create documents store
        if (!db.objectStoreNames.contains('documents')) {
          const documentStore = db.createObjectStore('documents', { keyPath: 'id' })
          documentStore.createIndex('estateId', 'estateId')
          documentStore.createIndex('type', 'type')
        }
      },
    })

    return this.db
  }

  // Estate management
  async saveEstate(estate: EstateData): Promise<void> {
    const db = await this.init()
    await db.put('estates', estate)
  }

  async getEstate(id: string): Promise<EstateData | undefined> {
    const db = await this.init()
    return await db.get('estates', id)
  }

  async getAllEstates(userId: string): Promise<EstateData[]> {
    const db = await this.init()
    return await db.getAllFromIndex('estates', 'userId', userId)
  }

  async deleteEstate(id: string): Promise<void> {
    const db = await this.init()
    await db.delete('estates', id)
  }

  // Beneficiary management
  async saveBeneficiary(beneficiary: BeneficiaryData): Promise<void> {
    const db = await this.init()
    await db.put('beneficiaries', beneficiary)
  }

  async getBeneficiaries(estateId: string): Promise<BeneficiaryData[]> {
    const db = await this.init()
    return await db.getAllFromIndex('beneficiaries', 'estateId', estateId)
  }

  // Wallet management
  async saveWallet(wallet: WalletData): Promise<void> {
    const db = await this.init()
    await db.put('wallets', wallet)
  }

  async getWallet(address: string): Promise<WalletData | undefined> {
    const db = await this.init()
    return await db.getFromIndex('wallets', 'address', address)
  }

  async getAllWallets(): Promise<WalletData[]> {
    const db = await this.init()
    return await db.getAll('wallets')
  }

  // Document management
  async saveDocument(document: DocumentData): Promise<void> {
    const db = await this.init()
    await db.put('documents', document)
  }

  async getDocument(id: string): Promise<DocumentData | undefined> {
    const db = await this.init()
    return await db.get('documents', id)
  }

  async getDocumentsByEstate(estateId: string): Promise<DocumentData[]> {
    const db = await this.init()
    return await db.getAllFromIndex('documents', 'estateId', estateId)
  }

  // Export/Import functionality
  async exportAllData(): Promise<Blob> {
    const db = await this.init()
    const data = {
      estates: await db.getAll('estates'),
      beneficiaries: await db.getAll('beneficiaries'),
      wallets: await db.getAll('wallets'),
      documents: await db.getAll('documents'),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }
    
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  }

  async importData(file: File): Promise<void> {
    const text = await file.text()
    const data = JSON.parse(text)
    
    const db = await this.init()
    const tx = db.transaction(['estates', 'beneficiaries', 'wallets', 'documents'], 'readwrite')
    
    if (data.estates) {
      for (const estate of data.estates) {
        await tx.objectStore('estates').put(estate)
      }
    }
    
    if (data.beneficiaries) {
      for (const beneficiary of data.beneficiaries) {
        await tx.objectStore('beneficiaries').put(beneficiary)
      }
    }
    
    if (data.wallets) {
      for (const wallet of data.wallets) {
        await tx.objectStore('wallets').put(wallet)
      }
    }
    
    if (data.documents) {
      for (const document of data.documents) {
        await tx.objectStore('documents').put(document)
      }
    }
    
    await tx.done
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    const db = await this.init()
    await db.clear('estates')
    await db.clear('beneficiaries')
    await db.clear('wallets')
    await db.clear('documents')
  }
}

// Create singleton instance
export const clientStorage = new ClientStorage()

// Utility functions for localStorage
export const userPreferences = {
  save: (key: string, value: any) => {
    localStorage.setItem(`lastwish_${key}`, JSON.stringify(value))
  },
  get: (key: string) => {
    const item = localStorage.getItem(`lastwish_${key}`)
    return item ? JSON.parse(item) : null
  },
  remove: (key: string) => {
    localStorage.removeItem(`lastwish_${key}`)
  },
  clear: () => {
    Object.keys(localStorage)
      .filter(key => key.startsWith('lastwish_'))
      .forEach(key => localStorage.removeItem(key))
  }
}