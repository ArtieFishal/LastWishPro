import React, { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useWallet } from '@solana/wallet-adapter-react'
import { useChain } from '@cosmos-kit/react'
import { useMultiChainWallet } from './MultiChainWalletProvider'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const EnhancedWalletConnection = () => {
  const [selectedBlockchain, setSelectedBlockchain] = useState('ethereum')
  const [selectedWallet, setSelectedWallet] = useState('')
  const [connectionStatus, setConnectionStatus] = useState({})
  const [dappUrl, setDappUrl] = useState('')
  
  // Ethereum/EVM hooks
  const { address: ethAddress, isConnected: ethConnected } = useAccount()
  const { disconnect: ethDisconnect } = useDisconnect()
  
  // Solana hooks
  const { 
    wallet: solWallet, 
    connect: solConnect, 
    disconnect: solDisconnect,
    publicKey: solPublicKey,
    connected: solConnected 
  } = useWallet()
  
  // Cosmos hooks
  const { connect: cosmosConnect, disconnect: cosmosDisconnect, address: cosmosAddress } = useChain('cosmoshub')
  
  // Multi-chain context
  const {
    connectedWallets,
    walletBalances,
    dappConnections,
    connectWallet,
    disconnectWallet,
    getWalletBalance,
    connectToDapp,
    disconnectFromDapp
  } = useMultiChainWallet()

  // Blockchain configurations
  const blockchains = {
    ethereum: {
      name: 'Ethereum',
      icon: '⟠',
      wallets: ['MetaMask', 'WalletConnect', 'Coinbase Wallet', 'Rainbow', 'Trust Wallet'],
      rpcUrl: 'https://mainnet.infura.io/v3/demo',
      explorer: 'https://etherscan.io'
    },
    solana: {
      name: 'Solana',
      icon: '◎',
      wallets: ['Phantom', 'Solflare', 'Backpack', 'Glow', 'Slope'],
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      explorer: 'https://explorer.solana.com'
    },
    cosmos: {
      name: 'Cosmos',
      icon: '⚛',
      wallets: ['Keplr', 'Cosmostation', 'Leap'],
      rpcUrl: 'https://cosmos-rpc.polkachu.com',
      explorer: 'https://www.mintscan.io/cosmos'
    },
    polkadot: {
      name: 'Polkadot',
      icon: '●',
      wallets: ['Polkadot.js', 'Talisman', 'SubWallet'],
      rpcUrl: 'wss://rpc.polkadot.io',
      explorer: 'https://polkadot.subscan.io'
    },
    near: {
      name: 'NEAR',
      icon: 'Ⓝ',
      wallets: ['NEAR Wallet', 'MyNearWallet', 'Meteor Wallet'],
      rpcUrl: 'https://rpc.mainnet.near.org',
      explorer: 'https://explorer.near.org'
    },
    bitcoin: {
      name: 'Bitcoin',
      icon: '₿',
      wallets: ['Unisat', 'Xverse', 'Leather', 'OKX Wallet'],
      rpcUrl: 'https://blockstream.info/api',
      explorer: 'https://blockstream.info'
    }
  }

  // Popular dApps by blockchain
  const popularDapps = {
    ethereum: [
      { name: 'Uniswap', url: 'https://app.uniswap.org', category: 'DEX' },
      { name: 'Aave', url: 'https://app.aave.com', category: 'Lending' },
      { name: 'OpenSea', url: 'https://opensea.io', category: 'NFT' },
      { name: 'Compound', url: 'https://app.compound.finance', category: 'Lending' },
      { name: 'SushiSwap', url: 'https://app.sushi.com', category: 'DEX' }
    ],
    solana: [
      { name: 'Jupiter', url: 'https://jup.ag', category: 'DEX' },
      { name: 'Raydium', url: 'https://raydium.io', category: 'DEX' },
      { name: 'Magic Eden', url: 'https://magiceden.io', category: 'NFT' },
      { name: 'Marinade', url: 'https://marinade.finance', category: 'Staking' },
      { name: 'Orca', url: 'https://www.orca.so', category: 'DEX' }
    ],
    cosmos: [
      { name: 'Osmosis', url: 'https://app.osmosis.zone', category: 'DEX' },
      { name: 'Keplr Dashboard', url: 'https://wallet.keplr.app', category: 'Wallet' },
      { name: 'Mintscan', url: 'https://www.mintscan.io', category: 'Explorer' },
      { name: 'Emeris', url: 'https://emeris.com', category: 'DEX' }
    ],
    polkadot: [
      { name: 'Polkadot.js Apps', url: 'https://polkadot.js.org/apps', category: 'Governance' },
      { name: 'Subscan', url: 'https://polkadot.subscan.io', category: 'Explorer' },
      { name: 'Polkassembly', url: 'https://polkadot.polkassembly.io', category: 'Governance' }
    ],
    near: [
      { name: 'Ref Finance', url: 'https://app.ref.finance', category: 'DEX' },
      { name: 'Burrow', url: 'https://app.burrow.finance', category: 'Lending' },
      { name: 'Paras', url: 'https://paras.id', category: 'NFT' }
    ],
    bitcoin: [
      { name: 'Ordinals', url: 'https://ordinals.com', category: 'NFT' },
      { name: 'Magic Eden Bitcoin', url: 'https://magiceden.io/bitcoin', category: 'NFT' },
      { name: 'Unisat', url: 'https://unisat.io', category: 'Wallet' }
    ]
  }

  // Handle wallet connection
  const handleConnect = async () => {
    try {
      setConnectionStatus(prev => ({ ...prev, [selectedBlockchain]: 'connecting' }))
      
      switch (selectedBlockchain) {
        case 'ethereum':
          // Handled by RainbowKit ConnectButton
          break
        case 'solana':
          if (solWallet) {
            await solConnect()
          }
          break
        case 'cosmos':
          await cosmosConnect()
          break
        default:
          await connectWallet(selectedBlockchain, selectedWallet)
      }
      
      setConnectionStatus(prev => ({ ...prev, [selectedBlockchain]: 'connected' }))
    } catch (error) {
      console.error('Connection failed:', error)
      setConnectionStatus(prev => ({ ...prev, [selectedBlockchain]: 'failed' }))
    }
  }

  // Handle wallet disconnection
  const handleDisconnect = async (blockchain) => {
    try {
      switch (blockchain) {
        case 'ethereum':
          ethDisconnect()
          break
        case 'solana':
          await solDisconnect()
          break
        case 'cosmos':
          await cosmosDisconnect()
          break
        default:
          disconnectWallet(blockchain)
      }
      
      setConnectionStatus(prev => ({ ...prev, [blockchain]: 'disconnected' }))
    } catch (error) {
      console.error('Disconnection failed:', error)
    }
  }

  // Handle dApp connection
  const handleDappConnect = async (dapp) => {
    try {
      await connectToDapp(dapp.url, selectedBlockchain)
      alert(`Connected to ${dapp.name}!`)
    } catch (error) {
      console.error('dApp connection failed:', error)
      alert(`Failed to connect to ${dapp.name}`)
    }
  }

  // Get connection status for blockchain
  const getConnectionStatus = (blockchain) => {
    switch (blockchain) {
      case 'ethereum':
        return ethConnected ? 'connected' : 'disconnected'
      case 'solana':
        return solConnected ? 'connected' : 'disconnected'
      case 'cosmos':
        return cosmosAddress ? 'connected' : 'disconnected'
      default:
        return connectedWallets[blockchain] ? 'connected' : 'disconnected'
    }
  }

  // Get wallet address for blockchain
  const getWalletAddress = (blockchain) => {
    switch (blockchain) {
      case 'ethereum':
        return ethAddress
      case 'solana':
        return solPublicKey?.toString()
      case 'cosmos':
        return cosmosAddress
      default:
        return connectedWallets[blockchain]?.address
    }
  }

  // Update balances when wallets connect
  useEffect(() => {
    Object.keys(blockchains).forEach(blockchain => {
      const address = getWalletAddress(blockchain)
      if (address && getConnectionStatus(blockchain) === 'connected') {
        getWalletBalance(blockchain, address)
      }
    })
  }, [connectedWallets, ethAddress, solPublicKey, cosmosAddress])

  return (
    <div className="space-y-6">
      {/* Blockchain Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          🔗 Multi-Chain Wallet Connection
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {Object.entries(blockchains).map(([key, blockchain]) => (
            <button
              key={key}
              onClick={() => setSelectedBlockchain(key)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedBlockchain === key
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-2xl mb-1">{blockchain.icon}</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {blockchain.name}
              </div>
              <div className={`text-xs mt-1 ${
                getConnectionStatus(key) === 'connected' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {getConnectionStatus(key) === 'connected' ? '● Connected' : '○ Disconnected'}
              </div>
            </button>
          ))}
        </div>

        {/* Wallet Selection and Connection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Wallet for {blockchains[selectedBlockchain].name}
            </label>
            
            {selectedBlockchain === 'ethereum' ? (
              <div className="flex items-center space-x-4">
                <ConnectButton />
                {ethConnected && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Connected: {ethAddress?.slice(0, 6)}...{ethAddress?.slice(-4)}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Choose a wallet...</option>
                  {blockchains[selectedBlockchain].wallets.map(wallet => (
                    <option key={wallet} value={wallet}>{wallet}</option>
                  ))}
                </select>
                
                <div className="flex space-x-3">
                  {getConnectionStatus(selectedBlockchain) === 'connected' ? (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {getWalletAddress(selectedBlockchain)?.slice(0, 8)}...
                        {getWalletAddress(selectedBlockchain)?.slice(-6)}
                      </div>
                      <button
                        onClick={() => handleDisconnect(selectedBlockchain)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleConnect}
                      disabled={!selectedWallet && selectedBlockchain !== 'ethereum'}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {connectionStatus[selectedBlockchain] === 'connecting' ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connected Wallets Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          💼 Connected Wallets Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(blockchains).map(([key, blockchain]) => {
            const isConnected = getConnectionStatus(key) === 'connected'
            const address = getWalletAddress(key)
            const balance = walletBalances[`${key}-${address}`] || '0'
            
            return (
              <div
                key={key}
                className={`p-4 rounded-lg border-2 ${
                  isConnected 
                    ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20' 
                    : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{blockchain.icon}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {blockchain.name}
                    </span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                
                {isConnected ? (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {address?.slice(0, 10)}...{address?.slice(-8)}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Balance: {balance}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Not connected
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Popular dApps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          🚀 Popular dApps for {blockchains[selectedBlockchain].name}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularDapps[selectedBlockchain]?.map((dapp, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">{dapp.name}</h4>
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                  {dapp.category}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDappConnect(dapp)}
                  disabled={getConnectionStatus(selectedBlockchain) !== 'connected'}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Connect
                </button>
                <a
                  href={dapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  Visit
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active dApp Connections */}
      {dappConnections.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            🔌 Active dApp Connections
          </h3>
          
          <div className="space-y-3">
            {dappConnections.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {new URL(connection.url).hostname}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {blockchains[connection.blockchain].name} • Connected {new Date(connection.connectedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => disconnectFromDapp(connection.id)}
                  className="px-3 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors text-sm"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom dApp Connection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          🌐 Connect to Custom dApp
        </h3>
        
        <div className="flex space-x-3">
          <input
            type="url"
            value={dappUrl}
            onChange={(e) => setDappUrl(e.target.value)}
            placeholder="Enter dApp URL (e.g., https://app.uniswap.org)"
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            onClick={() => handleDappConnect({ name: 'Custom dApp', url: dappUrl })}
            disabled={!dappUrl || getConnectionStatus(selectedBlockchain) !== 'connected'}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Connect
          </button>
        </div>
        
        {getConnectionStatus(selectedBlockchain) !== 'connected' && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Connect a wallet first to interact with dApps
          </p>
        )}
      </div>
    </div>
  )
}

export default EnhancedWalletConnection

