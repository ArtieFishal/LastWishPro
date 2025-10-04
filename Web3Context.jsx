import React, { createContext, useContext, useEffect, useState } from 'react'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from 'wagmi'
import { config, chains, BLOCKCHAIN_NETWORKS } from '../config/web3'
import { toast } from 'sonner'

// Setup queryClient
const queryClient = new QueryClient()

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  enableAnalytics: false,
  enableOnramp: false,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#1a1a1a',
    '--w3m-color-mix-strength': 20,
    '--w3m-accent': '#3b82f6',
    '--w3m-border-radius-master': '8px'
  }
})

const Web3Context = createContext({})

// Web3 provider component that uses Wagmi hooks
function Web3ProviderInner({ children }) {
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address })
  
  const [connectedWallets, setConnectedWallets] = useState([])
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [walletAssets, setWalletAssets] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Get current network info
  const currentNetwork = Object.values(BLOCKCHAIN_NETWORKS).find(
    network => network.chainId === chainId
  ) || BLOCKCHAIN_NETWORKS.ethereum

  // Update connected wallets when account changes
  useEffect(() => {
    if (isConnected && address) {
      const walletInfo = {
        id: `${connector?.name}-${address}`,
        address,
        name: connector?.name || 'Unknown Wallet',
        type: connector?.type || 'unknown',
        chainId,
        network: currentNetwork,
        balance: balance ? {
          value: balance.value,
          formatted: balance.formatted,
          symbol: balance.symbol
        } : null,
        isConnected: true,
        connectedAt: new Date().toISOString()
      }

      setConnectedWallets(prev => {
        const existing = prev.find(w => w.address === address)
        if (existing) {
          return prev.map(w => w.address === address ? walletInfo : w)
        }
        return [...prev, walletInfo]
      })

      if (!selectedWallet) {
        setSelectedWallet(walletInfo)
      }

      toast.success(`${connector?.name} connected successfully`)
    } else {
      setConnectedWallets([])
      setSelectedWallet(null)
    }
  }, [isConnected, address, connector, chainId, balance, currentNetwork, selectedWallet])

  // Connect wallet function
  const connectWallet = async (walletType) => {
    try {
      setIsLoading(true)
      const connector = connectors.find(c => 
        c.name.toLowerCase().includes(walletType.toLowerCase()) ||
        c.type.toLowerCase().includes(walletType.toLowerCase())
      )
      
      if (connector) {
        await connect({ connector })
      } else {
        // Fallback to first available connector
        await connect({ connector: connectors[0] })
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      toast.error('Failed to connect wallet')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Disconnect wallet function
  const disconnectWallet = async (walletId) => {
    try {
      if (walletId) {
        // Remove specific wallet
        setConnectedWallets(prev => prev.filter(w => w.id !== walletId))
        if (selectedWallet?.id === walletId) {
          const remaining = connectedWallets.filter(w => w.id !== walletId)
          setSelectedWallet(remaining[0] || null)
        }
      } else {
        // Disconnect all
        await disconnect()
        setConnectedWallets([])
        setSelectedWallet(null)
        toast.success('Wallet disconnected')
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      toast.error('Failed to disconnect wallet')
      throw error
    }
  }

  // Switch network function
  const switchNetwork = async (networkChainId) => {
    try {
      // This will be handled by the Web3Modal automatically
      // when user tries to switch networks
      console.log('Switching to network:', networkChainId)
    } catch (error) {
      console.error('Failed to switch network:', error)
      toast.error('Failed to switch network')
      throw error
    }
  }

// Fetch wallet assets using Zapper API
const fetchWalletAssets = async (walletAddress, selectedNetworks) => {
  console.log('Fetching assets for:', walletAddress, 'on networks:', selectedNetworks);
  setIsLoading(true);
  try {
    const apiKey = import.meta.env.VITE_ZAPPER_API_KEY || 'YOUR_ZAPPER_API_KEY';
    if (apiKey === 'YOUR_ZAPPER_API_KEY') {
      console.warn('Zapper API key not found. Please add VITE_ZAPPER_API_KEY to your .env file.');
      toast.error('Zapper API key not configured.');
      return [];
    }

    const networksToFetch = selectedNetworks && selectedNetworks.length > 0
      ? selectedNetworks
      : Object.values(BLOCKCHAIN_NETWORKS).map(n => n.id);
      
    const networksQuery = networksToFetch.join(',');
    const url = `https://api.zapper.fi/v2/balances/tokens?addresses[]=${walletAddress}&networks[]=${networksQuery}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${btoa(apiKey + ':')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Zapper API call failed with status: ${response.status}`);
    }

    const data = await response.json();

    const assets = data.map(item => ({
      id: `${item.token.network}-${item.token.address}`,
      type: item.token.type,
      symbol: item.token.symbol,
      name: item.token.name,
      balance: item.balance,
      balanceRaw: item.balanceRaw,
      balanceUSD: item.balanceUSD,
      price: item.token.price,
      network: BLOCKCHAIN_NETWORKS[item.token.network] || { name: item.token.network, id: item.token.network, symbol: '' },
      contractAddress: item.token.address,
      decimals: item.token.decimals,
      icon: item.token.icon,
    }));

    setWalletAssets(assets);
    toast.success(`Found ${assets.length} assets for the wallet.`);
    return assets;
  } catch (error) {
    console.error('Failed to fetch wallet assets from Zapper:', error);
    toast.error('Failed to fetch wallet assets.');
    return [];
  } finally {
    setIsLoading(false);
  }
};

  // Add wallet to estate plan
  const addWalletToEstate = async (walletId, beneficiaryInfo) => {
    try {
      const wallet = connectedWallets.find(w => w.id === walletId)
      if (!wallet) throw new Error('Wallet not found')

      // TODO: Send to backend API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/wallets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          address: wallet.address,
          network: wallet.network.name,
          chainId: wallet.chainId,
          beneficiary: beneficiaryInfo,
          assets: walletAssets
        })
      })

      if (!response.ok) throw new Error('Failed to add wallet to estate')
      
      const result = await response.json()
      toast.success('Wallet added to estate plan')
      return result
    } catch (error) {
      console.error('Failed to add wallet to estate:', error)
      toast.error('Failed to add wallet to estate plan')
      throw error
    }
  }

  // Open Web3Modal
  const openModal = () => {
    const modal = document.querySelector('w3m-modal')
    if (modal) {
      modal.open()
    } else {
      // Fallback: create and trigger modal
      const button = document.createElement('w3m-button')
      document.body.appendChild(button)
      button.click()
      document.body.removeChild(button)
    }
  }

  const value = {
    // Connection state
    isConnected,
    isLoading: isLoading || isPending,
    
    // Wallet management
    connectedWallets,
    selectedWallet,
    setSelectedWallet,
    
    // Network info
    currentNetwork,
    chainId,
    
    // Assets
    walletAssets,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    fetchWalletAssets,
    addWalletToEstate,
    
    // Web3Modal actions
    openModal,
    
    // Utilities
    formatAddress: (address) => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '',
    formatBalance: (balance, decimals = 4) => {
      if (!balance) return '0'
      const num = parseFloat(balance)
      return num.toFixed(decimals)
    }
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}

// Main provider component with Wagmi and QueryClient
export function Web3Provider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Web3ProviderInner>
          {children}
        </Web3ProviderInner>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

