'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wallet, Plus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface ConnectedWallet {
  id: string
  blockchain: string
  address: string
  walletType: string
  isVerified: boolean
  discoveredAssets: Asset[]
}

interface Asset {
  symbol: string
  name: string
  balance: string
  type: string
}

const blockchains = {
  ethereum: { name: 'Ethereum', icon: '⟠', wallets: ['MetaMask', 'WalletConnect', 'Coinbase Wallet', 'Rainbow'] },
  solana: { name: 'Solana', icon: '◎', wallets: ['Phantom', 'Solflare', 'Backpack'] },
  bitcoin: { name: 'Bitcoin', icon: '₿', wallets: ['Unisat', 'Xverse', 'Leather'] },
  polygon: { name: 'Polygon', icon: '⬟', wallets: ['MetaMask', 'WalletConnect'] },
  cosmos: { name: 'Cosmos', icon: '⚛', wallets: ['Keplr', 'Cosmostation'] },
  cardano: { name: 'Cardano', icon: '₳', wallets: ['Nami', 'Eternl'] }
}

export default function WalletManager() {
  const { data: session } = useSession()
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([])
  const [selectedBlockchain, setSelectedBlockchain] = useState('')
  const [selectedWallet, setSelectedWallet] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDiscovering, setIsDiscovering] = useState<string | null>(null)

  const connectWallet = async () => {
    if (!selectedBlockchain || !selectedWallet) return

    setIsConnecting(true)
    try {
      // Mock wallet connection - in production this would use actual wallet APIs
      const mockAddress = generateMockAddress(selectedBlockchain)
      const message = `Connect to LastWish.eth\n\nAddress: ${mockAddress}\nBlockchain: ${selectedBlockchain}\nTimestamp: ${Date.now()}`
      
      // Simulate signature
      const mockSignature = 'mock_signature_' + Math.random().toString(36)

      const response = await fetch('/api/wallets/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: mockAddress,
          blockchain: selectedBlockchain,
          walletType: selectedWallet,
          message,
          signature: mockSignature
        })
      })

      if (response.ok) {
        const data = await response.json()
        fetchWallets() // Refresh wallet list
        setSelectedBlockchain('')
        setSelectedWallet('')
      } else {
        throw new Error('Failed to connect wallet')
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
      alert('Failed to connect wallet. This is a demo - in production, you would connect your actual wallet.')
    } finally {
      setIsConnecting(false)
    }
  }

  const discoverAssets = async (walletId: string) => {
    setIsDiscovering(walletId)
    try {
      const response = await fetch('/api/wallets/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId })
      })

      if (response.ok) {
        fetchWallets() // Refresh to show discovered assets
      } else {
        throw new Error('Failed to discover assets')
      }
    } catch (error) {
      console.error('Asset discovery error:', error)
      alert('Failed to discover assets. Please ensure your Moralis API key is configured.')
    } finally {
      setIsDiscovering(null)
    }
  }

  const fetchWallets = async () => {
    try {
      // This would fetch from your API - for now showing mock data
      const mockWallets: ConnectedWallet[] = [
        {
          id: '1',
          blockchain: 'ethereum',
          address: '0x742d35Cc6634C0532925a3b8D0C9e3e8d4C4A8B9',
          walletType: 'MetaMask',
          isVerified: true,
          discoveredAssets: [
            { symbol: 'ETH', name: 'Ethereum', balance: '2.5', type: 'NATIVE' },
            { symbol: 'USDC', name: 'USD Coin', balance: '1000', type: 'TOKEN' }
          ]
        }
      ]
      setConnectedWallets(mockWallets)
    } catch (error) {
      console.error('Failed to fetch wallets:', error)
    }
  }

  const generateMockAddress = (blockchain: string) => {
    const prefixes: Record<string, string> = {
      ethereum: '0x',
      solana: '',
      bitcoin: 'bc1',
      polygon: '0x',
      cosmos: 'cosmos',
      cardano: 'addr1'
    }
    
    const prefix = prefixes[blockchain] || '0x'
    const chars = '0123456789abcdef'
    let address = prefix
    
    for (let i = prefix.length; i < 42; i++) {
      address += chars[Math.floor(Math.random() * chars.length)]
    }
    
    return address
  }

  useEffect(() => {
    if (session) {
      fetchWallets()
    }
  }, [session])

  return (
    <div className="space-y-6">
      {/* Add New Wallet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Connect New Wallet
          </CardTitle>
          <CardDescription>
            Connect and verify ownership of your cryptocurrency wallets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedBlockchain} onValueChange={setSelectedBlockchain}>
              <SelectTrigger>
                <SelectValue placeholder="Select Blockchain" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(blockchains).map(([key, blockchain]) => (
                  <SelectItem key={key} value={key}>
                    {blockchain.icon} {blockchain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={selectedWallet} 
              onValueChange={setSelectedWallet}
              disabled={!selectedBlockchain}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Wallet" />
              </SelectTrigger>
              <SelectContent>
                {selectedBlockchain && blockchains[selectedBlockchain as keyof typeof blockchains]?.wallets.map(wallet => (
                  <SelectItem key={wallet} value={wallet}>
                    {wallet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={connectWallet}
              disabled={!selectedBlockchain || !selectedWallet || isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connected Wallets */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Wallets</CardTitle>
          <CardDescription>
            Your verified cryptocurrency wallets and discovered assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectedWallets.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No wallets connected yet. Connect your first wallet above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {connectedWallets.map((wallet) => (
                <div key={wallet.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {blockchains[wallet.blockchain as keyof typeof blockchains]?.icon}
                      </span>
                      <div>
                        <h3 className="font-medium">
                          {blockchains[wallet.blockchain as keyof typeof blockchains]?.name} - {wallet.walletType}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {wallet.isVerified ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => discoverAssets(wallet.id)}
                        disabled={isDiscovering === wallet.id}
                      >
                        {isDiscovering === wallet.id ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Discovering...
                          </>
                        ) : (
                          'Discover Assets'
                        )}
                      </Button>
                    </div>
                  </div>

                  {wallet.discoveredAssets.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Discovered Assets:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {wallet.discoveredAssets.map((asset, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{asset.symbol}</span>
                              <Badge variant="outline" className="text-xs">
                                {asset.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {asset.balance} {asset.symbol}
                            </p>
                            <p className="text-xs text-gray-500">
                              {asset.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

