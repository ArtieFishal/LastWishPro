import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Coins, Image, TrendingUp, RefreshCw, ExternalLink, Wallet } from 'lucide-react'
import { ethers } from 'ethers'

const AssetViewer = ({ account, provider }) => {
  const [tokens, setTokens] = useState([])
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Mock token data for demonstration
  const mockTokens = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: '2.5432',
      value: '$4,123.45',
      change: '+5.2%',
      logo: '🔷'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: '1,250.00',
      value: '$1,250.00',
      change: '+0.1%',
      logo: '💵'
    },
    {
      symbol: 'UNI',
      name: 'Uniswap',
      balance: '45.67',
      value: '$312.89',
      change: '-2.3%',
      logo: '🦄'
    }
  ]

  // Mock NFT data for demonstration
  const mockNFTs = [
    {
      id: '1',
      name: 'CryptoPunk #1234',
      collection: 'CryptoPunks',
      image: '🎭',
      value: '15.5 ETH'
    },
    {
      id: '2',
      name: 'Bored Ape #5678',
      collection: 'Bored Ape Yacht Club',
      image: '🐵',
      value: '12.3 ETH'
    },
    {
      id: '3',
      name: 'Art Block #9012',
      collection: 'Art Blocks',
      image: '🎨',
      value: '2.1 ETH'
    }
  ]

  useEffect(() => {
    if (account && provider) {
      loadAssets()
    }
  }, [account, provider])

  const loadAssets = async () => {
    setLoading(true)
    setError(null)

    try {
      // In a real implementation, you would fetch actual token balances
      // For demo purposes, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setTokens(mockTokens)
      setNfts(mockNFTs)
    } catch (err) {
      setError('Failed to load assets')
      console.error('Error loading assets:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshAssets = () => {
    loadAssets()
  }

  const getTotalValue = () => {
    return tokens.reduce((total, token) => {
      const value = parseFloat(token.value.replace(/[$,]/g, ''))
      return total + value
    }, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  if (!account) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Asset Viewer
          </CardTitle>
          <CardDescription>
            Connect your wallet to view your cryptocurrency and NFT assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No wallet connected</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Your Assets
            </CardTitle>
            <CardDescription>
              Portfolio value: {getTotalValue()}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAssets}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tokens" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="nfts">NFTs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tokens" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading tokens...</p>
              </div>
            ) : tokens.length > 0 ? (
              <div className="space-y-3">
                {tokens.map((token, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{token.logo}</div>
                      <div>
                        <p className="font-medium">{token.symbol}</p>
                        <p className="text-sm text-muted-foreground">{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{token.balance} {token.symbol}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">{token.value}</p>
                        <Badge 
                          variant={token.change.startsWith('+') ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {token.change}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tokens found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="nfts" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading NFTs...</p>
              </div>
            ) : nfts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nfts.map((nft) => (
                  <Card key={nft.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="text-6xl text-center mb-3">{nft.image}</div>
                      <h3 className="font-medium text-sm mb-1">{nft.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{nft.collection}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {nft.value}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No NFTs found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Demo Mode</h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            This is a demonstration of asset viewing capabilities. In a production environment, 
            this would connect to real blockchain APIs to fetch your actual token balances and NFTs.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default AssetViewer

