import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Wallet, 
  Plus, 
  ExternalLink, 
  Copy, 
  Trash2, 
  RefreshCw,
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Search
} from 'lucide-react'
import { useWeb3 } from '@/contexts/Web3Context'
import { useWallet } from '@/contexts/WalletContext'
import { SUPPORTED_WALLETS, BLOCKCHAIN_NETWORKS, ASSET_TYPES } from '@/config/web3'
import { toast } from 'sonner'

export function WalletsPage() {
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
    addWalletToEstate,
    openModal,
    formatAddress,
    formatBalance
  } = useWeb3()

  const { sessions, connectWallet: connectBackendWallet } = useWallet()
  
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [showAssets, setShowAssets] = useState({})
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    walletId: null,
    name: '',
    email: '',
    relationship: '',
    percentage: 100
  })

  const [selectedNetworks, setSelectedNetworks] = useState(Object.values(BLOCKCHAIN_NETWORKS).map(n => n.id))

  // Handle network selection
  const handleNetworkSelect = (networkId) => {
    setSelectedNetworks(prev =>
      prev.includes(networkId)
        ? prev.filter(id => id !== networkId)
        : [...prev, networkId]
    )
  }

  // Handle fetching assets
  const handleFetchAssets = () => {
    if (selectedWallet) {
      fetchWalletAssets(selectedWallet.address, selectedNetworks)
    } else {
      toast.error('Please connect a wallet first.')
    }
  }

  // Handle wallet connection
  const handleConnectWallet = async (walletType) => {
    try {
      await connectWallet(walletType)
      setShowConnectModal(false)
      
      // Also connect to backend
      if (selectedWallet) {
        await connectBackendWallet({
          address: selectedWallet.address,
          blockchain: currentNetwork.name.toLowerCase(),
          wallet_type: walletType
        })
      }
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

  // Handle beneficiary assignment
  const handleAssignBeneficiary = async () => {
    try {
      await addWalletToEstate(beneficiaryForm.walletId, {
        name: beneficiaryForm.name,
        email: beneficiaryForm.email,
        relationship: beneficiaryForm.relationship,
        percentage: beneficiaryForm.percentage
      })
      
      setBeneficiaryForm({
        walletId: null,
        name: '',
        email: '',
        relationship: '',
        percentage: 100
      })
      
      toast.success('Beneficiary assigned successfully')
    } catch (error) {
      console.error('Failed to assign beneficiary:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Crypto Wallets</h1>
          <p className="text-gray-400">Connect and manage your cryptocurrency wallets for estate planning.</p>
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

      {/* Asset Discovery */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5" />
            Asset Discovery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Select Blockchains to Scan</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.values(BLOCKCHAIN_NETWORKS).map(network => (
                  <Button
                    key={network.id}
                    variant={selectedNetworks.includes(network.id) ? 'secondary' : 'outline'}
                    onClick={() => handleNetworkSelect(network.id)}
                    className="border-gray-600"
                  >
                    {network.name}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              onClick={handleFetchAssets}
              disabled={isLoading || !selectedWallet}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Scan for Assets
            </Button>
          </div>
        </CardContent>
      </Card>

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
                      <Label className="text-gray-400">Network</Label>
                      <p className="text-white">{wallet.network.name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400">Balance</Label>
                      <p className="text-white">
                        {wallet.balance ? 
                          `${formatBalance(wallet.balance.formatted)} ${wallet.balance.symbol}` : 
                          'Loading...'
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-400">Type</Label>
                      <p className="text-white capitalize">{wallet.type}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400">Connected</Label>
                      <p className="text-white">
                        {new Date(wallet.connectedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Assets */}
                  {showAssets[wallet.id] && (
                    <div className="space-y-3">
                      <Separator className="bg-gray-700" />
                      <div>
                        <Label className="text-gray-400">Assets</Label>
                        <div className="mt-2 space-y-2">
                          {walletAssets.length > 0 ? (
                            walletAssets.map((asset) => (
                              <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <img src={asset.icon} alt={asset.name} className="h-8 w-8 rounded-full" />
                                  <div>
                                    <p className="text-white font-medium">{asset.name}</p>
                                    <p className="text-gray-400 text-sm">{asset.symbol}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                                    {asset.network.name}
                                  </Badge>
                                  <div className="text-right">
                                    <p className="text-white">{formatBalance(asset.balance)}</p>
                                    <p className="text-gray-400 text-sm">
                                      ${asset.balanceUSD?.toFixed(2) || '0.00'}
                                    </p>
                                  </div>
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

                  {/* Beneficiary Assignment */}
                  <div className="space-y-3">
                    <Separator className="bg-gray-700" />
                    <div>
                      <Label className="text-gray-400">Estate Planning</Label>
                      <div className="mt-2">
                        <Button
                          onClick={() => setBeneficiaryForm({ ...beneficiaryForm, walletId: wallet.id })}
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          Assign Beneficiary
                        </Button>
                      </div>
                    </div>
                  </div>
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

      {/* Beneficiary Assignment Modal */}
      {beneficiaryForm.walletId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-gray-900 border-gray-800 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white">Assign Beneficiary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-400">Beneficiary Name</Label>
                  <Input
                    value={beneficiaryForm.name}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, name: e.target.value })}
                    placeholder="Enter beneficiary name"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-400">Email</Label>
                  <Input
                    type="email"
                    value={beneficiaryForm.email}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, email: e.target.value })}
                    placeholder="Enter email address"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-400">Relationship</Label>
                  <Input
                    value={beneficiaryForm.relationship}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, relationship: e.target.value })}
                    placeholder="e.g., Spouse, Child, Sibling"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-400">Percentage (%)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={beneficiaryForm.percentage}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, percentage: parseInt(e.target.value) })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => setBeneficiaryForm({ walletId: null, name: '', email: '', relationship: '', percentage: 100 })}
                  variant="outline"
                  className="flex-1 border-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignBeneficiary}
                  disabled={!beneficiaryForm.name || !beneficiaryForm.email}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Assign
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
              Connect your cryptocurrency wallets to start building your estate plan.
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
  )
}

