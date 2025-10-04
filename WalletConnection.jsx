import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Wallet, ExternalLink, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import { ethers } from 'ethers'

const WalletConnection = () => {
  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [provider, setProvider] = useState(null)

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          setAccount(accounts[0].address)
          setProvider(provider)
          await updateAccountInfo(provider, accounts[0].address)
        }
      } catch (err) {
        console.error('Error checking connection:', err)
      }
    }
  }

  const updateAccountInfo = async (provider, address) => {
    try {
      const balance = await provider.getBalance(address)
      const network = await provider.getNetwork()
      setBalance(ethers.formatEther(balance))
      setChainId(network.chainId.toString())
    } catch (err) {
      console.error('Error updating account info:', err)
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask to connect your wallet.')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      
      setAccount(address)
      setProvider(provider)
      await updateAccountInfo(provider, address)
    } catch (err) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setBalance(null)
    setChainId(null)
    setProvider(null)
    setError(null)
  }

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
    }
  }

  const getChainName = (chainId) => {
    const chains = {
      '1': 'Ethereum Mainnet',
      '5': 'Goerli Testnet',
      '11155111': 'Sepolia Testnet',
      '137': 'Polygon Mainnet',
      '80001': 'Polygon Mumbai',
      '56': 'BSC Mainnet',
      '97': 'BSC Testnet'
    }
    return chains[chainId] || `Chain ID: ${chainId}`
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Connection Demo
        </CardTitle>
        <CardDescription>
          Connect your wallet to view your assets and interact with dApps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!account ? (
          <Button 
            onClick={connectWallet} 
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div>
                <p className="text-sm font-medium">Connected Account</p>
                <p className="text-xs text-muted-foreground">{formatAddress(account)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyAddress}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>

            {balance && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Balance</p>
                <p className="text-lg font-bold">{parseFloat(balance).toFixed(4)} ETH</p>
              </div>
            )}

            {chainId && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Network</p>
                <Badge variant="outline" className="mt-1">
                  {getChainName(chainId)}
                </Badge>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={disconnectWallet}
                className="flex-1"
              >
                Disconnect
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </Button>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-800 dark:text-green-200">
                  Wallet successfully connected! You can now interact with dApps and view your assets.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>Supported wallets: MetaMask, Coinbase Wallet, WalletConnect, and other Web3 wallets</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default WalletConnection

