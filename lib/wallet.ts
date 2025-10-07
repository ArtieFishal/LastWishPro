import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, polygon, arbitrum, optimism } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { createPublicClient, createWalletClient, custom } from 'viem'
import { clientStorage, type WalletData, type DigitalAsset } from './storage'

// Wallet configuration
export const config = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum, optimism],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    }),
    coinbaseWallet({
      appName: 'Last Wish',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
})

// Blockchain API configurations
const BLOCKCHAIN_APIS = {
  ethereum: {
    etherscan: 'https://api.etherscan.io/api',
    moralis: 'https://deep-index.moralis.io/api/v2',
  },
  polygon: {
    polygonscan: 'https://api.polygonscan.com/api',
    moralis: 'https://deep-index.moralis.io/api/v2',
  },
  arbitrum: {
    arbiscan: 'https://api.arbiscan.io/api',
    moralis: 'https://deep-index.moralis.io/api/v2',
  },
  optimism: {
    optimistic: 'https://api-optimistic.etherscan.io/api',
    moralis: 'https://deep-index.moralis.io/api/v2',
  },
}

// Wallet connection manager
export class WalletManager {
  private connectedWallets: Map<string, WalletData> = new Map()

  async connectWallet(connector: any, chainId: number) {
    try {
      const account = await connector.getAccount()
      const chain = connector.getChain()
      
      const walletData: WalletData = {
        id: `${chainId}-${account.address}`,
        address: account.address,
        blockchain: this.getChainName(chainId),
        connectedAt: new Date(),
        lastSyncAt: new Date(),
        assets: []
      }

      // Load assets for this wallet
      await this.loadWalletAssets(walletData)
      
      // Save to storage
      await clientStorage.saveWallet(walletData)
      this.connectedWallets.set(walletData.id, walletData)
      
      return walletData
    } catch (error) {
      console.error('Wallet connection failed:', error)
      throw error
    }
  }

  async disconnectWallet(walletId: string) {
    this.connectedWallets.delete(walletId)
    // Note: We keep the wallet data in storage for reference
  }

  async loadWalletAssets(wallet: WalletData): Promise<DigitalAsset[]> {
    const assets: DigitalAsset[] = []
    
    try {
      // Load native token balance
      const nativeAsset = await this.getNativeTokenBalance(wallet.address, wallet.blockchain)
      if (nativeAsset) {
        assets.push(nativeAsset)
      }

      // Load ERC-20 tokens
      const erc20Assets = await this.getERC20Tokens(wallet.address, wallet.blockchain)
      assets.push(...erc20Assets)

      // Load NFTs
      const nftAssets = await this.getNFTs(wallet.address, wallet.blockchain)
      assets.push(...nftAssets)

      // Update wallet with loaded assets
      wallet.assets = assets
      wallet.lastSyncAt = new Date()
      await clientStorage.saveWallet(wallet)

      return assets
    } catch (error) {
      console.error('Failed to load wallet assets:', error)
      return assets
    }
  }

  private async getNativeTokenBalance(address: string, blockchain: string): Promise<DigitalAsset | null> {
    try {
      const chainId = this.getChainId(blockchain)
      const publicClient = createPublicClient({
        chain: this.getChain(chainId),
        transport: http()
      })

      const balance = await publicClient.getBalance({ address: address as `0x${string}` })
      const balanceInEth = Number(balance) / 1e18

      // Get USD value (simplified - in production, use a price API)
      const usdValue = await this.getTokenPrice('ETH') * balanceInEth

      return {
        id: `${blockchain}-native-${address}`,
        type: 'cryptocurrency',
        blockchain,
        walletAddress: address,
        symbol: this.getNativeSymbol(blockchain),
        name: this.getNativeName(blockchain),
        balance: balanceInEth.toString(),
        estimatedValue: usdValue,
        accessInstructions: `Native ${this.getNativeName(blockchain)} token in wallet ${address}`
      }
    } catch (error) {
      console.error('Failed to get native token balance:', error)
      return null
    }
  }

  private async getERC20Tokens(address: string, blockchain: string): Promise<DigitalAsset[]> {
    // This would integrate with Moralis API or similar
    // For now, return demo data
    return [
      {
        id: `${blockchain}-usdc-${address}`,
        type: 'cryptocurrency',
        blockchain,
        contractAddress: '0xA0b86a33E6441b8C4C8C0C4C8C0C4C8C0C4C8C0C4',
        walletAddress: address,
        symbol: 'USDC',
        name: 'USD Coin',
        balance: '1000.00',
        estimatedValue: 1000,
        accessInstructions: `ERC-20 USDC token in wallet ${address}`
      }
    ]
  }

  private async getNFTs(address: string, blockchain: string): Promise<DigitalAsset[]> {
    // This would integrate with OpenSea API or similar
    // For now, return demo data
    return [
      {
        id: `${blockchain}-nft-${address}-1`,
        type: 'nft',
        blockchain,
        contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
        tokenId: '1234',
        walletAddress: address,
        symbol: 'BAYC',
        name: 'Bored Ape #1234',
        balance: '1',
        estimatedValue: 50000,
        accessInstructions: `Bored Ape Yacht Club NFT #1234 in wallet ${address}`
      }
    ]
  }

  private async getTokenPrice(symbol: string): Promise<number> {
    try {
      // In production, use a real price API like CoinGecko
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`)
      const data = await response.json()
      return data[symbol.toLowerCase()]?.usd || 0
    } catch (error) {
      console.error('Failed to get token price:', error)
      return 0
    }
  }

  private getChainName(chainId: number): string {
    const chains = {
      1: 'ethereum',
      11155111: 'ethereum', // Sepolia
      137: 'polygon',
      42161: 'arbitrum',
      10: 'optimism'
    }
    return chains[chainId as keyof typeof chains] || 'ethereum'
  }

  private getChainId(blockchain: string): number {
    const chainIds = {
      ethereum: 1,
      polygon: 137,
      arbitrum: 42161,
      optimism: 10
    }
    return chainIds[blockchain as keyof typeof chainIds] || 1
  }

  private getChain(chainId: number) {
    const chains = {
      1: mainnet,
      11155111: sepolia,
      137: polygon,
      42161: arbitrum,
      10: optimism
    }
    return chains[chainId as keyof typeof chains] || mainnet
  }

  private getNativeSymbol(blockchain: string): string {
    const symbols = {
      ethereum: 'ETH',
      polygon: 'MATIC',
      arbitrum: 'ETH',
      optimism: 'ETH'
    }
    return symbols[blockchain as keyof typeof symbols] || 'ETH'
  }

  private getNativeName(blockchain: string): string {
    const names = {
      ethereum: 'Ethereum',
      polygon: 'Polygon',
      arbitrum: 'Arbitrum',
      optimism: 'Optimism'
    }
    return names[blockchain as keyof typeof names] || 'Ethereum'
  }

  // Get all connected wallets
  getConnectedWallets(): WalletData[] {
    return Array.from(this.connectedWallets.values())
  }

  // Get wallet by address
  getWalletByAddress(address: string): WalletData | undefined {
    return Array.from(this.connectedWallets.values()).find(w => w.address === address)
  }

  // Refresh all wallet data
  async refreshAllWallets(): Promise<void> {
    for (const wallet of this.connectedWallets.values()) {
      await this.loadWalletAssets(wallet)
    }
  }
}

// Create singleton instance
export const walletManager = new WalletManager()

// Utility functions for wallet operations
export const walletUtils = {
  formatAddress: (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  },
  
  formatBalance: (balance: string, decimals: number = 4) => {
    const num = parseFloat(balance)
    return num.toFixed(decimals)
  },
  
  formatUSD: (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  },
  
  getExplorerUrl: (address: string, blockchain: string) => {
    const explorers = {
      ethereum: `https://etherscan.io/address/${address}`,
      polygon: `https://polygonscan.com/address/${address}`,
      arbitrum: `https://arbiscan.io/address/${address}`,
      optimism: `https://optimistic.etherscan.io/address/${address}`
    }
    return explorers[blockchain as keyof typeof explorers] || explorers.ethereum
  }
}