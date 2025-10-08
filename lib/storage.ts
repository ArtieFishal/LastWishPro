import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface EstateDB extends DBSchema {
  estates: {
    key: string
    value: any
    indexes: { 'by-userId': string; 'by-status': string }
  }
  beneficiaries: {
    key: string
    value: any
    indexes: { 'by-estateId': string }
  }
  assets: {
    key: string
    value: any
    indexes: { 'by-estateId': string; 'by-type': string }
  }
}

let db: IDBPDatabase<EstateDB> | null = null

export const initDB = async (): Promise<IDBPDatabase<EstateDB>> => {
  if (db) return db

  db = await openDB<EstateDB>('estateDB', 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('estates')) {
        const estateStore = database.createObjectStore('estates', { keyPath: 'id' })
        estateStore.createIndex('by-userId', 'userId')
        estateStore.createIndex('by-status', 'status')
      }
      if (!database.objectStoreNames.contains('beneficiaries')) {
        const beneficiaryStore = database.createObjectStore('beneficiaries', { keyPath: 'id' })
        beneficiaryStore.createIndex('by-estateId', 'estateId')
      }
      if (!database.objectStoreNames.contains('assets')) {
        const assetStore = database.createObjectStore('assets', { keyPath: 'id' })
        assetStore.createIndex('by-estateId', 'estateId')
        assetStore.createIndex('by-type', 'type')
      }
    },
  })

  return db
}

export const saveEstate = async (estate: any) => {
  const database = await initDB()
  await database.put('estates', estate)
}

export const getEstates = async (userId: string) => {
  const database = await initDB()
  return await database.getAllFromIndex('estates', 'by-userId', userId)
}

export const saveBeneficiary = async (beneficiary: any) => {
  const database = await initDB()
  await database.put('beneficiaries', beneficiary)
}

export const getBeneficiaries = async (estateId: string) => {
  const database = await initDB()
  return await database.getAllFromIndex('beneficiaries', 'by-estateId', estateId)
}

export const saveAsset = async (asset: any) => {
  const database = await initDB()
  await database.put('assets', asset)
}

export const getAssets = async (estateId: string) => {
  const database = await initDB()
  return await database.getAllFromIndex('assets', 'by-estateId', estateId)
}
