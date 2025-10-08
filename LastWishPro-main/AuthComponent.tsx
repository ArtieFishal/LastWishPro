'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, Chrome, Shield, Zap } from 'lucide-react'

declare global {
  interface Window {
    ethereum?: any
  }
}

export default function AuthComponent() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' })
  }

  const handleWalletSignIn = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Ethereum wallet to continue')
      return
    }

    setIsConnecting(true)
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      if (accounts.length === 0) {
        alert('No accounts found. Please connect your wallet.')
        return
      }

      const address = accounts[0]
      setWalletAddress(address)

      const message = `Sign in to LastWish.eth\n\nAddress: ${address}\nTimestamp: ${Date.now()}\n\nBy signing this message, you prove ownership of this wallet address.`
      
      // Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      })
      
      if (signature) {
        // Sign in with the signature
        await signIn('ethereum', {
          message,
          signature,
          callbackUrl: '/'
        })
      }
    } catch (error: any) {
      console.error('Wallet sign in error:', error)
      if (error.code === 4001) {
        alert('Please approve the connection to continue')
      } else {
        alert('Failed to sign in with wallet. Please try again.')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Wallet className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            LastWish.eth
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Secure crypto asset discovery and inheritance planning
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Cryptographically secure wallet verification
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Multi-blockchain asset discovery
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Wallet className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Legal document generation
            </span>
          </div>
        </div>

        {/* Sign In Options */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In to Continue</CardTitle>
            <CardDescription>
              Choose your preferred sign-in method to access LastWish.eth
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Sign In */}
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2"
            >
              <Chrome className="h-4 w-4" />
              <span>Continue with Google</span>
            </Button>

            {/* Demo Sign In */}
            <Button
              onClick={() => {
                // Demo login - creates a mock user session
                signIn('ethereum', {
                  message: 'Demo login for LastWish.eth',
                  signature: 'demo_signature_' + Date.now(),
                  callbackUrl: '/'
                })
              }}
              variant="secondary"
              className="w-full flex items-center justify-center space-x-2"
            >
              <Wallet className="h-4 w-4" />
              <span>Demo Login (Skip Wallet Connection)</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or Connect Real Wallet
                </span>
              </div>
            </div>

            {/* Wallet Sign In */}
            <Button
              onClick={handleWalletSignIn}
              disabled={isConnecting}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Wallet className="h-4 w-4" />
              <span>
                {isConnecting 
                  ? 'Connecting...' 
                  : walletAddress
                    ? `Sign in with ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                    : 'Connect with Ethereum Wallet'
                }
              </span>
            </Button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Use Demo Login to test the platform, or connect MetaMask for real wallet integration
            </p>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            🔒 Your private keys never leave your wallet. We only verify ownership through cryptographic signatures.
          </p>
        </div>
      </div>
    </div>
  )
}

