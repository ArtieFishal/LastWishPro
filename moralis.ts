import Moralis from 'moralis'

let isInitialized = false

export const initializeMoralis = async () => {
  if (!isInitialized && !Moralis.Core.isStarted) {
    await Moralis.start({
      apiKey: process.env.MORALIS_API_KEY!,
    })
    isInitialized = true
  }
}

export const getWalletTokens = async (address: string, chain: string = 'eth') => {
  await initializeMoralis()
  
  try {
    const response = await Moralis.EvmApi.token.getWalletTokenBalances({
      address,
      chain,
    })
    
    return response.toJSON()
  } catch (error) {
    console.error('Error fetching wallet tokens:', error)
    return []
  }
}

export const getWalletNFTs = async (address: string, chain: string = 'eth') => {
  await initializeMoralis()
  
  try {
    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      address,
      chain,
      limit: 100,
    })
    
    return response.toJSON()
  } catch (error) {
    console.error('Error fetching wallet NFTs:', error)
    return []
  }
}

export const getNativeBalance = async (address: string, chain: string = 'eth') => {
  await initializeMoralis()
  
  try {
    const response = await Moralis.EvmApi.balance.getNativeBalance({
      address,
      chain,
    })
    
    return response.toJSON()
  } catch (error) {
    console.error('Error fetching native balance:', error)
    return null
  }
}

export const resolveENS = async (ensName: string) => {
  await initializeMoralis()
  
  try {
    const response = await Moralis.EvmApi.resolve.resolveENSDomain({
      domain: ensName,
    })
    
    return response.toJSON()
  } catch (error) {
    console.error('Error resolving ENS:', error)
    return null
  }
}

