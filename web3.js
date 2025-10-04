import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { mainnet, sepolia, polygon, arbitrum, optimism, base } from 'wagmi/chains'

// Get projectId from environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

// Define the chains your app will work with
export const chains = [
  mainnet,
  sepolia, // Ethereum testnet
  polygon,
  arbitrum,
  optimism,
  base
]

// Create wagmiConfig
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata: {
    name: 'Last Wish',
    description: 'Secure Your Crypto Legacy For Your Loved Ones',
    url: 'https://lastwish.app',
    icons: ['https://lastwish.app/icon.png']
  },
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true
})

// Supported wallet types for display
export const SUPPORTED_WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Connect using MetaMask browser extension'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect using WalletConnect protocol'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    description: 'Connect using Coinbase Wallet'
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    description: 'Connect using Trust Wallet'
  }
]

// Blockchain networks configuration
export const BLOCKCHAIN_NETWORKS = {
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    icon: '⟠',
    color: '#627EEA',
    explorer: 'https://etherscan.io'
  },
  polygon: {
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    icon: '⬟',
    color: '#8247E5',
    explorer: 'https://polygonscan.com'
  },
  arbitrum: {
    name: 'Arbitrum',
    symbol: 'ETH',
    chainId: 42161,
    icon: '🔵',
    color: '#28A0F0',
    explorer: 'https://arbiscan.io'
  },
  optimism: {
    name: 'Optimism',
    symbol: 'ETH',
    chainId: 10,
    icon: '🔴',
    color: '#FF0420',
    explorer: 'https://optimistic.etherscan.io'
  },
  base: {
    name: 'Base',
    symbol: 'ETH',
    chainId: 8453,
    icon: '🔵',
    color: '#0052FF',
    explorer: 'https://basescan.org'
  }
}

// Asset types that can be tracked
export const ASSET_TYPES = {
  native: {
    name: 'Native Token',
    description: 'ETH, MATIC, etc.',
    icon: '💎'
  },
  erc20: {
    name: 'ERC-20 Tokens',
    description: 'USDC, USDT, DAI, etc.',
    icon: '🪙'
  },
  erc721: {
    name: 'NFTs (ERC-721)',
    description: 'Unique digital collectibles',
    icon: '🖼️'
  },
  erc1155: {
    name: 'Multi-Token (ERC-1155)',
    description: 'Gaming tokens and assets',
    icon: '🎮'
  }
}

