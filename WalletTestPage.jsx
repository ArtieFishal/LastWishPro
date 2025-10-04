import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Wallet, 
  Plus, 
  Copy, 
  Trash2, 
  RefreshCw,
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { useWeb3 } from '@/contexts/Web3Context'
import { SUPPORTED_WALLETS, BLOCKCHAIN_NETWORKS, ASSET_TYPES } from '@/config/web3'
import { toast } from 'sonner'

export function WalletTestPage() {
  const { 
    isConnected, 
    isLoading, 
    connectedWallets, 
    selectedWallet,
    setSelectedWallet,
    currentNetwork,
    walletAssets,
    connectWallet,
    disconnectWallet,
    fetchWalletAssets,
    openModal,
    formatAddress,
    formatBalance
  } = useWeb3()
  
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [showAssets, setShowAssets] = useState({})

  // Load assets for connected wallets
  useEffect(() => {
    if (selectedWallet) {
      fetchWalletAssets(selectedWallet.address)
    }
  }, [selectedWallet, fetchWalletAssets])

  // Handle wallet connection
  const handleConnectWallet = async (walletType) => {
    try {
      await connectWallet(walletType)
      setShowConnectModal(false)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  // Handle wallet disconnection
  const handleDisconnectWallet = async (walletId) => {
    try {
      await disconnectWallet(walletId)
      toast.success('Wallet disconnected successfully')
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  // Copy address to clipboard
  const copyAddress = (address) => {
    navigator.clipboard.writeText(address)
    toast.success('Address copied to clipboard')
  }

  // Toggle asset visibility
  const toggleAssets = (walletId) => {
    setShowAssets(prev => ({
      ...prev,
      [walletId]: !prev[walletId]
    }))
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Wallet Integration Test</h1>
            <p className="text-gray-400">Test the Web3 wallet connection functionality.</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowConnectModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
            <Button 
              onClick={openModal}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Web3Modal
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <span className="text-gray-300">
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              
              {currentNetwork && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    {currentNetwork.name}
                  </Badge>
                </div>
              )}
              
              <div className="text-sm text-gray-400">
                {connectedWallets.length} wallet{connectedWallets.length !== 1 ? 's' : ''} connected
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connected Wallets */}
        {connectedWallets.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Connected Wallets</h2>
            
            {connectedWallets.map((wallet) => (
              <Card key={wallet.id} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{wallet.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
                            {formatAddress(wallet.address)}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyAddress(wallet.address)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAssets(wallet.id)}
                        className="border-gray-600"
                      >
                        {showAssets[wallet.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fetchWalletAssets(wallet.address)}
                        disabled={isLoading}
                        className="border-gray-600"
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDisconnectWallet(wallet.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Wallet Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm">Network</label>
                        <p className="text-white">{wallet.network.name}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Balance</label>
                        <p className="text-white">
                          {wallet.balance ? 
                            `${formatBalance(wallet.balance.formatted)} ${wallet.balance.symbol}` : 
                            'Loading...'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Type</label>
                        <p className="text-white capitalize">{wallet.type}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Connected</label>
                        <p className="text-white">
                          {new Date(wallet.connectedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Assets */}
                    {showAssets[wallet.id] && (
                      <div className="space-y-3">
                        <hr className="border-gray-700" />
                        <div>
                          <label className="text-gray-400 text-sm">Assets</label>
                          <div className="mt-2 space-y-2">
                            {walletAssets.length > 0 ? (
                              walletAssets.map((asset) => (
                                <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="text-2xl">
                                      {ASSET_TYPES[asset.type]?.icon || '💎'}
                                    </div>
                                    <div>
                                      <p className="text-white font-medium">{asset.name}</p>
                                      <p className="text-gray-400 text-sm">{asset.symbol}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-white">{formatBalance(asset.balance)}</p>
                                    <p className="text-gray-400 text-sm">
                                      ${asset.usdValue?.toFixed(2) || '0.00'}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400 text-center py-4">No assets found</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Connect Wallet Modal */}
        {showConnectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-gray-900 border-gray-800 w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-white">Connect Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {SUPPORTED_WALLETS.map((wallet) => (
                    <Button
                      key={wallet.id}
                      onClick={() => handleConnectWallet(wallet.id)}
                      disabled={isLoading}
                      className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white"
                    >
                      <span className="mr-3 text-xl">{wallet.icon}</span>
                      <div className="text-left">
                        <div className="font-medium">{wallet.name}</div>
                        <div className="text-sm text-gray-400">{wallet.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
                
                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={() => setShowConnectModal(false)}
                    variant="outline"
                    className="flex-1 border-gray-600"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {connectedWallets.length === 0 && !isLoading && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="text-center py-12">
              <Wallet className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Wallets Connected</h3>
              <p className="text-gray-400 mb-6">
                Connect your cryptocurrency wallets to test the integration.
              </p>
              <Button 
                onClick={() => setShowConnectModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Connect Your First Wallet
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

