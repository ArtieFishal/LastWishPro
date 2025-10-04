import React, { createContext, useContext, useState, useEffect } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, polygon, arbitrum, optimism, base, bsc } from 'wagmi/chains'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  SolletWalletAdapter,
  MathWalletAdapter,
  Coin98WalletAdapter,
  SlopeWalletAdapter,
  TrustWalletAdapter,
  CloverWalletAdapter,
  BitpieWalletAdapter,
  BitgetWalletAdapter,
  ExodusWalletAdapter,
  BackpackWalletAdapter,
  GlowWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { ChainProvider } from '@cosmos-kit/react'
import { chains, assets } from 'chain-registry'
import { wallets as keplrWallets } from '@cosmos-kit/keplr'

// Multi-chain context
const MultiChainContext = createContext()

// Wagmi config for EVM chains
const wagmiConfig = getDefaultConfig({
  appName: 'Crypto Wallet Connect Models',
  projectId: 'demo-project-id', // In production, use a real WalletConnect project ID
  chains: [mainnet, polygon, arbitrum, optimism, base, bsc],
  ssr: false,
})

// Query client for React Query
const queryClient = new QueryClient()

// Solana network
const network = WalletAdapterNetwork.Mainnet
const endpoint = clusterApiUrl(network)

// Solana wallets
const solanaWallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new TorusWalletAdapter(),
  new LedgerWalletAdapter(),
  new SolletWalletAdapter(),
  new MathWalletAdapter(),
  new Coin98WalletAdapter(),
  new SlopeWalletAdapter(),
  new TrustWalletAdapter(),
  new CloverWalletAdapter(),
  new BitpieWalletAdapter(),
  new BitgetWalletAdapter(),
  new ExodusWalletAdapter(),
  new BackpackWalletAdapter(),
  new GlowWalletAdapter(),
]

// Cosmos chains (subset for demo)
const cosmosChains = chains.filter(chain => 
  ['cosmoshub', 'osmosis', 'juno', 'stargaze', 'akash'].includes(chain.chain_name)
)

export const MultiChainWalletProvider = ({ children }) => {
  const [connectedWallets, setConnectedWallets] = useState({
    ethereum: null,
    solana: null,
    cosmos: null,
    polkadot: null,
    near: null,
    bitcoin: null,
  })

  const [walletBalances, setWalletBalances] = useState({})
  const [dappConnections, setDappConnections] = useState([])

  // Connect to different blockchain networks
  const connectWallet = async (blockchain, walletType) => {
    try {
      switch (blockchain) {
        case 'ethereum':
          // Handled by RainbowKit/Wagmi
          break
        case 'solana':
          // Handled by Solana wallet adapter
          break
        case 'cosmos':
          // Handled by Cosmos Kit
          break
        case 'polkadot':
          await connectPolkadot(walletType)
          break
        case 'near':
          await connectNear(walletType)
          break
        case 'bitcoin':
          await connectBitcoin(walletType)
          break
        default:
          throw new Error(`Unsupported blockchain: ${blockchain}`)
      }
    } catch (error) {
      console.error(`Failed to connect to ${blockchain}:`, error)
      throw error
    }
  }

  // Polkadot connection
  const connectPolkadot = async (walletType) => {
    if (typeof window !== 'undefined') {
      const { web3Accounts, web3Enable } = await import('@polkadot/extension-dapp')
      
      const extensions = await web3Enable('Crypto Wallet Connect Models')
      if (extensions.length === 0) {
        throw new Error('No Polkadot extension found')
      }

      const accounts = await web3Accounts()
      if (accounts.length > 0) {
        setConnectedWallets(prev => ({
          ...prev,
          polkadot: {
            address: accounts[0].address,
            name: accounts[0].meta.name,
            source: accounts[0].meta.source
          }
        }))
      }
    }
  }

  // NEAR connection
  const connectNear = async (walletType) => {
    if (typeof window !== 'undefined') {
      try {
        // Simplified NEAR connection - in production use proper NEAR wallet selector
        const nearConnection = {
          address: 'demo.near',
          accountId: 'demo.near',
          network: 'mainnet'
        }
        
        setConnectedWallets(prev => ({
          ...prev,
          near: nearConnection
        }))
      } catch (error) {
        console.error('NEAR connection failed:', error)
        throw error
      }
    }
  }

  // Bitcoin connection (simplified demo)
  const connectBitcoin = async (walletType) => {
    if (typeof window !== 'undefined') {
      try {
        // Simplified Bitcoin connection - in production use proper Bitcoin wallet libraries
        const bitcoinConnection = {
          address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          network: 'mainnet',
          walletType: walletType
        }
        
        setConnectedWallets(prev => ({
          ...prev,
          bitcoin: bitcoinConnection
        }))
      } catch (error) {
        console.error('Bitcoin connection failed:', error)
        throw error
      }
    }
  }

  // Disconnect wallet
  const disconnectWallet = (blockchain) => {
    setConnectedWallets(prev => ({
      ...prev,
      [blockchain]: null
    }))
  }

  // Get wallet balance
  const getWalletBalance = async (blockchain, address) => {
    try {
      // Simplified balance fetching - in production use proper RPC calls
      const mockBalances = {
        ethereum: '1.234 ETH',
        solana: '5.678 SOL',
        cosmos: '12.34 ATOM',
        polkadot: '9.876 DOT',
        near: '15.432 NEAR',
        bitcoin: '0.05432 BTC'
      }
      
      const balance = mockBalances[blockchain] || '0'
      setWalletBalances(prev => ({
        ...prev,
        [`${blockchain}-${address}`]: balance
      }))
      
      return balance
    } catch (error) {
      console.error(`Failed to get balance for ${blockchain}:`, error)
      return '0'
    }
  }

  // Connect to dApp
  const connectToDapp = async (dappUrl, blockchain) => {
    try {
      const connection = {
        id: Date.now(),
        url: dappUrl,
        blockchain: blockchain,
        connectedAt: new Date().toISOString(),
        status: 'connected'
      }
      
      setDappConnections(prev => [...prev, connection])
      return connection
    } catch (error) {
      console.error('Failed to connect to dApp:', error)
      throw error
    }
  }

  // Disconnect from dApp
  const disconnectFromDapp = (connectionId) => {
    setDappConnections(prev => prev.filter(conn => conn.id !== connectionId))
  }

  const contextValue = {
    connectedWallets,
    walletBalances,
    dappConnections,
    connectWallet,
    disconnectWallet,
    getWalletBalance,
    connectToDapp,
    disconnectFromDapp
  }

  return (
    <MultiChainContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <RainbowKitProvider>
            <ConnectionProvider endpoint={endpoint}>
              <WalletProvider wallets={solanaWallets} autoConnect>
                <ChainProvider
                  chains={cosmosChains}
                  assetLists={assets}
                  wallets={keplrWallets}
                  walletConnectOptions={{
                    signClient: {
                      projectId: 'demo-project-id',
                      relayUrl: 'wss://relay.walletconnect.com',
                      metadata: {
                        name: 'Crypto Wallet Connect Models',
                        description: 'Multi-chain wallet connection demo',
                        url: 'https://example.com',
                        icons: ['https://example.com/icon.png'],
                      },
                    },
                  }}
                >
                  {children}
                </ChainProvider>
              </WalletProvider>
            </ConnectionProvider>
          </RainbowKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </MultiChainContext.Provider>
  )
}

export const useMultiChainWallet = () => {
  const context = useContext(MultiChainContext)
  if (!context) {
    throw new Error('useMultiChainWallet must be used within a MultiChainWalletProvider')
  }
  return context
}

