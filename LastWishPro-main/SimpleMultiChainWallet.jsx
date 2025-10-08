import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'

const SimpleMultiChainWallet = () => {
  const [selectedBlockchain, setSelectedBlockchain] = useState('ethereum')
  const [selectedWallet, setSelectedWallet] = useState('')
  const [connectedWallets, setConnectedWallets] = useState({})
  const [dappConnections, setDappConnections] = useState([])
  const [customDappUrl, setCustomDappUrl] = useState('')

  // Blockchain configurations
  const blockchains = {
    ethereum: {
      name: 'Ethereum',
      icon: '⟠',
      color: 'bg-blue-500',
      wallets: ['MetaMask', 'WalletConnect', 'Coinbase Wallet', 'Rainbow', 'Trust Wallet'],
      rpcUrl: 'https://mainnet.infura.io/v3/demo',
      explorer: 'https://etherscan.io',
      protocols: ['WalletConnect', 'EIP-1193', 'EIP-6963']
    },
    solana: {
      name: 'Solana',
      icon: '◎',
      color: 'bg-purple-500',
      wallets: ['Phantom', 'Solflare', 'Backpack', 'Glow', 'Slope'],
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      explorer: 'https://explorer.solana.com',
      protocols: ['Solana Wallet Adapter', 'Solana Mobile Stack']
    },
    cosmos: {
      name: 'Cosmos',
      icon: '⚛',
      color: 'bg-indigo-500',
      wallets: ['Keplr', 'Cosmostation', 'Leap'],
      rpcUrl: 'https://cosmos-rpc.polkachu.com',
      explorer: 'https://www.mintscan.io/cosmos',
      protocols: ['Cosmos Kit', 'CosmJS', 'Keplr API']
    },
    polkadot: {
      name: 'Polkadot',
      icon: '●',
      color: 'bg-pink-500',
      wallets: ['Polkadot.js', 'Talisman', 'SubWallet'],
      rpcUrl: 'wss://rpc.polkadot.io',
      explorer: 'https://polkadot.subscan.io',
      protocols: ['Polkadot.js Extension', 'Substrate Connect']
    },
    near: {
      name: 'NEAR',
      icon: 'Ⓝ',
      color: 'bg-green-500',
      wallets: ['NEAR Wallet', 'MyNearWallet', 'Meteor Wallet'],
      rpcUrl: 'https://rpc.mainnet.near.org',
      explorer: 'https://explorer.near.org',
      protocols: ['NEAR Wallet Selector', 'NEAR API JS']
    },
    bitcoin: {
      name: 'Bitcoin',
      icon: '₿',
      color: 'bg-orange-500',
      wallets: ['Unisat', 'Xverse', 'Leather', 'OKX Wallet'],
      rpcUrl: 'https://blockstream.info/api',
      explorer: 'https://blockstream.info',
      protocols: ['BIP-322', 'Ordinals', 'BRC-20']
    },
    cardano: {
      name: 'Cardano',
      icon: '₳',
      color: 'bg-blue-600',
      wallets: ['Nami', 'Eternl', 'Flint', 'Yoroi'],
      rpcUrl: 'https://cardano-mainnet.blockfrost.io/api/v0',
      explorer: 'https://cardanoscan.io',
      protocols: ['CIP-30', 'Cardano Serialization Lib']
    },
    avalanche: {
      name: 'Avalanche',
      icon: '🔺',
      color: 'bg-red-500',
      wallets: ['Core', 'MetaMask', 'Avalanche Wallet'],
      rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
      explorer: 'https://snowtrace.io',
      protocols: ['EVM Compatible', 'Avalanche.js']
    }
  }

  // Popular dApps by blockchain
  const popularDapps = {
    ethereum: [
      { name: 'Uniswap', url: 'https://app.uniswap.org', category: 'DEX', description: 'Leading decentralized exchange' },
      { name: 'Aave', url: 'https://app.aave.com', category: 'Lending', description: 'Decentralized lending protocol' },
      { name: 'OpenSea', url: 'https://opensea.io', category: 'NFT', description: 'NFT marketplace' },
      { name: 'Compound', url: 'https://app.compound.finance', category: 'Lending', description: 'Algorithmic money markets' },
      { name: 'SushiSwap', url: 'https://app.sushi.com', category: 'DEX', description: 'Community-driven DEX' },
      { name: 'Curve', url: 'https://curve.fi', category: 'DEX', description: 'Stablecoin exchange' }
    ],
    solana: [
      { name: 'Jupiter', url: 'https://jup.ag', category: 'DEX', description: 'Solana DEX aggregator' },
      { name: 'Raydium', url: 'https://raydium.io', category: 'DEX', description: 'Automated market maker' },
      { name: 'Magic Eden', url: 'https://magiceden.io', category: 'NFT', description: 'Solana NFT marketplace' },
      { name: 'Marinade', url: 'https://marinade.finance', category: 'Staking', description: 'Liquid staking protocol' },
      { name: 'Orca', url: 'https://www.orca.so', category: 'DEX', description: 'User-friendly DEX' }
    ],
    cosmos: [
      { name: 'Osmosis', url: 'https://app.osmosis.zone', category: 'DEX', description: 'Cosmos DEX and AMM' },
      { name: 'Keplr Dashboard', url: 'https://wallet.keplr.app', category: 'Wallet', description: 'Cosmos wallet interface' },
      { name: 'Mintscan', url: 'https://www.mintscan.io', category: 'Explorer', description: 'Cosmos block explorer' },
      { name: 'Emeris', url: 'https://emeris.com', category: 'DEX', description: 'Cross-chain DEX' }
    ],
    polkadot: [
      { name: 'Polkadot.js Apps', url: 'https://polkadot.js.org/apps', category: 'Governance', description: 'Polkadot governance interface' },
      { name: 'Subscan', url: 'https://polkadot.subscan.io', category: 'Explorer', description: 'Substrate block explorer' },
      { name: 'Polkassembly', url: 'https://polkadot.polkassembly.io', category: 'Governance', description: 'Governance discussion platform' }
    ],
    near: [
      { name: 'Ref Finance', url: 'https://app.ref.finance', category: 'DEX', description: 'NEAR DEX and AMM' },
      { name: 'Burrow', url: 'https://app.burrow.finance', category: 'Lending', description: 'NEAR lending protocol' },
      { name: 'Paras', url: 'https://paras.id', category: 'NFT', description: 'NEAR NFT marketplace' }
    ],
    bitcoin: [
      { name: 'Ordinals', url: 'https://ordinals.com', category: 'NFT', description: 'Bitcoin NFTs and inscriptions' },
      { name: 'Magic Eden Bitcoin', url: 'https://magiceden.io/bitcoin', category: 'NFT', description: 'Bitcoin NFT marketplace' },
      { name: 'Unisat', url: 'https://unisat.io', category: 'Wallet', description: 'Bitcoin wallet and tools' }
    ],
    cardano: [
      { name: 'Minswap', url: 'https://app.minswap.org', category: 'DEX', description: 'Cardano DEX' },
      { name: 'JPG Store', url: 'https://www.jpg.store', category: 'NFT', description: 'Cardano NFT marketplace' },
      { name: 'SundaeSwap', url: 'https://app.sundaeswap.finance', category: 'DEX', description: 'Cardano AMM' }
    ],
    avalanche: [
      { name: 'Trader Joe', url: 'https://traderjoexyz.com', category: 'DEX', description: 'Avalanche DEX' },
      { name: 'Pangolin', url: 'https://app.pangolin.exchange', category: 'DEX', description: 'Community-driven DEX' },
      { name: 'Benqi', url: 'https://app.benqi.fi', category: 'Lending', description: 'Avalanche lending protocol' }
    ]
  }

  // Mock wallet connection
  const connectWallet = async () => {
    if (!selectedWallet) return

    try {
      // Simulate wallet connection
      const mockAddress = generateMockAddress(selectedBlockchain)
      const mockBalance = generateMockBalance(selectedBlockchain)
      
      setConnectedWallets(prev => ({
        ...prev,
        [selectedBlockchain]: {
          wallet: selectedWallet,
          address: mockAddress,
          balance: mockBalance,
          connectedAt: new Date().toISOString()
        }
      }))
      
      alert(`Successfully connected ${selectedWallet} to ${blockchains[selectedBlockchain].name}!`)
    } catch (error) {
      alert(`Failed to connect to ${selectedWallet}`)
    }
  }

  // Mock address generation
  const generateMockAddress = (blockchain) => {
    const prefixes = {
      ethereum: '0x',
      solana: '',
      cosmos: 'cosmos',
      polkadot: '1',
      near: '',
      bitcoin: 'bc1',
      cardano: 'addr1',
      avalanche: '0x'
    }
    
    const lengths = {
      ethereum: 42,
      solana: 44,
      cosmos: 45,
      polkadot: 48,
      near: 64,
      bitcoin: 42,
      cardano: 103,
      avalanche: 42
    }
    
    const prefix = prefixes[blockchain] || ''
    const length = lengths[blockchain] || 42
    const chars = '0123456789abcdef'
    let address = prefix
    
    for (let i = prefix.length; i < length; i++) {
      address += chars[Math.floor(Math.random() * chars.length)]
    }
    
    return address
  }

  // Mock balance generation
  const generateMockBalance = (blockchain) => {
    const tokens = {
      ethereum: 'ETH',
      solana: 'SOL',
      cosmos: 'ATOM',
      polkadot: 'DOT',
      near: 'NEAR',
      bitcoin: 'BTC',
      cardano: 'ADA',
      avalanche: 'AVAX'
    }
    
    const amount = (Math.random() * 10).toFixed(3)
    return `${amount} ${tokens[blockchain]}`
  }

  // Disconnect wallet
  const disconnectWallet = (blockchain) => {
    setConnectedWallets(prev => {
      const updated = { ...prev }
      delete updated[blockchain]
      return updated
    })
  }

  // Connect to dApp
  const connectToDapp = (dapp) => {
    if (!connectedWallets[selectedBlockchain]) {
      alert('Please connect a wallet first!')
      return
    }

    const connection = {
      id: Date.now(),
      dappName: dapp.name,
      dappUrl: dapp.url,
      blockchain: selectedBlockchain,
      wallet: connectedWallets[selectedBlockchain].wallet,
      connectedAt: new Date().toISOString()
    }

    setDappConnections(prev => [...prev, connection])
    alert(`Connected to ${dapp.name} via ${connectedWallets[selectedBlockchain].wallet}!`)
  }

  // Connect to custom dApp
  const connectToCustomDapp = () => {
    if (!customDappUrl) return
    if (!connectedWallets[selectedBlockchain]) {
      alert('Please connect a wallet first!')
      return
    }

    try {
      const url = new URL(customDappUrl)
      const connection = {
        id: Date.now(),
        dappName: url.hostname,
        dappUrl: customDappUrl,
        blockchain: selectedBlockchain,
        wallet: connectedWallets[selectedBlockchain].wallet,
        connectedAt: new Date().toISOString()
      }

      setDappConnections(prev => [...prev, connection])
      setCustomDappUrl('')
      alert(`Connected to ${url.hostname}!`)
    } catch (error) {
      alert('Please enter a valid URL')
    }
  }

  // Disconnect from dApp
  const disconnectFromDapp = (connectionId) => {
    setDappConnections(prev => prev.filter(conn => conn.id !== connectionId))
  }

  return (
    <div className="space-y-6">
      {/* Blockchain Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🔗</span>
            <span>Multi-Chain Wallet Connection</span>
          </CardTitle>
          <CardDescription>
            Connect to multiple blockchains and interact with dApps using various wallet protocols
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
            {Object.entries(blockchains).map(([key, blockchain]) => {
              const isConnected = connectedWallets[key]
              return (
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
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    {blockchain.name}
                  </div>
                  <div className={`text-xs mt-1 ${
                    isConnected 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {isConnected ? '● Connected' : '○ Disconnected'}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Selected Blockchain Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">{blockchains[selectedBlockchain].icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {blockchains[selectedBlockchain].name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  RPC: {blockchains[selectedBlockchain].rpcUrl}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Supported Protocols:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {blockchains[selectedBlockchain].protocols.map((protocol, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {protocol}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Selection and Connection */}
          <div className="space-y-4">
            {connectedWallets[selectedBlockchain] ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-800 dark:text-green-200">
                        Connected to {connectedWallets[selectedBlockchain].wallet}
                      </span>
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      Address: {connectedWallets[selectedBlockchain].address.slice(0, 10)}...
                      {connectedWallets[selectedBlockchain].address.slice(-8)}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      Balance: {connectedWallets[selectedBlockchain].balance}
                    </div>
                  </div>
                  <Button
                    onClick={() => disconnectWallet(selectedBlockchain)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Wallet for {blockchains[selectedBlockchain].name}
                  </label>
                  <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a wallet..." />
                    </SelectTrigger>
                    <SelectContent>
                      {blockchains[selectedBlockchain].wallets.map(wallet => (
                        <SelectItem key={wallet} value={wallet}>{wallet}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  onClick={connectWallet}
                  disabled={!selectedWallet}
                  className="w-full"
                >
                  Connect {selectedWallet || 'Wallet'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connected Wallets Overview */}
      <Card>
        <CardHeader>
          <CardTitle>💼 Connected Wallets Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(blockchains).map(([key, blockchain]) => {
              const connection = connectedWallets[key]
              return (
                <div
                  key={key}
                  className={`p-4 rounded-lg border-2 ${
                    connection 
                      ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20' 
                      : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{blockchain.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {blockchain.name}
                      </span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      connection ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  
                  {connection ? (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {connection.wallet}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {connection.address.slice(0, 8)}...{connection.address.slice(-6)}
                      </div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white">
                        {connection.balance}
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
        </CardContent>
      </Card>

      {/* Popular dApps */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Popular dApps for {blockchains[selectedBlockchain].name}</CardTitle>
          <CardDescription>
            Connect to popular decentralized applications on {blockchains[selectedBlockchain].name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularDapps[selectedBlockchain]?.map((dapp, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{dapp.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {dapp.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {dapp.description}
                </p>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => connectToDapp(dapp)}
                    disabled={!connectedWallets[selectedBlockchain]}
                    size="sm"
                    className="flex-1"
                  >
                    Connect
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                  >
                    <a
                      href={dapp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom dApp Connection */}
      <Card>
        <CardHeader>
          <CardTitle>🌐 Connect to Custom dApp</CardTitle>
          <CardDescription>
            Enter any dApp URL to establish a connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <Input
              type="url"
              value={customDappUrl}
              onChange={(e) => setCustomDappUrl(e.target.value)}
              placeholder="Enter dApp URL (e.g., https://app.uniswap.org)"
              className="flex-1"
            />
            <Button
              onClick={connectToCustomDapp}
              disabled={!customDappUrl || !connectedWallets[selectedBlockchain]}
            >
              Connect
            </Button>
          </div>
          
          {!connectedWallets[selectedBlockchain] && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Connect a wallet first to interact with dApps
            </p>
          )}
        </CardContent>
      </Card>

      {/* Active dApp Connections */}
      {dappConnections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🔌 Active dApp Connections</CardTitle>
            <CardDescription>
              Manage your active dApp connections across all blockchains
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                        {connection.dappName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {blockchains[connection.blockchain].name} • {connection.wallet} • 
                        Connected {new Date(connection.connectedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <a
                        href={connection.dappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open
                      </a>
                    </Button>
                    <Button
                      onClick={() => disconnectFromDapp(connection.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SimpleMultiChainWallet

