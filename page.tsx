'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Moon, Sun, Wallet, Users, FileText, Shield, Plus, Download, Printer } from 'lucide-react'

interface ConnectedWallet {
  id: string
  blockchain: string
  address: string
  walletType: string
  assets: Asset[]
}

interface Asset {
  symbol: string
  name: string
  balance: string
  type: string
}

interface Beneficiary {
  id: string
  fullName: string
  relationship: string
  ethAddress: string
  phoneNumber: string
  email: string
  physicalAddress: string
  allocationPercentage: number
}

const blockchains = {
  ethereum: { name: 'Ethereum', icon: '⟠', wallets: ['MetaMask', 'WalletConnect', 'Coinbase Wallet'] },
  solana: { name: 'Solana', icon: '◎', wallets: ['Phantom', 'Solflare', 'Backpack'] },
  bitcoin: { name: 'Bitcoin', icon: '₿', wallets: ['Unisat', 'Xverse', 'Leather'] },
  polygon: { name: 'Polygon', icon: '⬟', wallets: ['MetaMask', 'WalletConnect'] },
}

export default function SimplePage() {
  const [darkMode, setDarkMode] = useState(false)
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([])
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [selectedBlockchain, setSelectedBlockchain] = useState('')
  const [selectedWallet, setSelectedWallet] = useState('')
  const [willDocument, setWillDocument] = useState('')

  // Beneficiary form
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    fullName: '',
    relationship: '',
    ethAddress: '',
    phoneNumber: '',
    email: '',
    physicalAddress: '',
    allocationPercentage: 0
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const connectWallet = () => {
    if (!selectedBlockchain || !selectedWallet) return

    const mockAddress = generateMockAddress(selectedBlockchain)
    const mockAssets = generateMockAssets(selectedBlockchain)

    const newWallet: ConnectedWallet = {
      id: Date.now().toString(),
      blockchain: selectedBlockchain,
      address: mockAddress,
      walletType: selectedWallet,
      assets: mockAssets
    }

    setConnectedWallets([...connectedWallets, newWallet])
    setSelectedBlockchain('')
    setSelectedWallet('')
  }

  const addBeneficiary = () => {
    if (!beneficiaryForm.fullName || !beneficiaryForm.ethAddress) return

    // Auto-calculate percentages
    const newBeneficiaryCount = beneficiaries.length + 1
    const equalPercentage = 100 / newBeneficiaryCount

    const newBeneficiary: Beneficiary = {
      id: Date.now().toString(),
      ...beneficiaryForm,
      allocationPercentage: beneficiaryForm.allocationPercentage || equalPercentage
    }

    // Update existing beneficiaries to equal distribution if no custom percentages
    const updatedBeneficiaries = beneficiaries.map(b => ({
      ...b,
      allocationPercentage: b.allocationPercentage === 0 ? equalPercentage : b.allocationPercentage
    }))

    setBeneficiaries([...updatedBeneficiaries, newBeneficiary])
    setBeneficiaryForm({
      fullName: '',
      relationship: '',
      ethAddress: '',
      phoneNumber: '',
      email: '',
      physicalAddress: '',
      allocationPercentage: 0
    })
  }

  const generateWill = () => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const willText = `
DIGITAL ASSET INHERITANCE ADDENDUM
LastWish.eth Platform

Generated on: ${currentDate}

I, [Your Name], being of sound mind and disposing memory, do hereby make this Digital Asset Inheritance Addendum to supplement my Last Will and Testament regarding the distribution of my cryptocurrency and digital assets.

SECTION 1: DIGITAL ASSET INVENTORY

I hereby declare that I own and control the following digital assets through verified wallet addresses:

${connectedWallets.map((wallet, index) => `
${index + 1}. ${wallet.blockchain.toUpperCase()} WALLET
   Address: ${wallet.address}
   Wallet Type: ${wallet.walletType}
   Assets:
${wallet.assets.map(asset => `   - ${asset.balance} ${asset.symbol} (${asset.name})`).join('\n')}
`).join('\n')}

SECTION 2: BENEFICIARY DESIGNATIONS

I hereby designate the following individuals as beneficiaries of my digital assets:

${beneficiaries.map((beneficiary, index) => `
${index + 1}. ${beneficiary.fullName}
   Relationship: ${beneficiary.relationship}
   Ethereum Address: ${beneficiary.ethAddress}
   Phone: ${beneficiary.phoneNumber}
   Email: ${beneficiary.email}
   Physical Address: ${beneficiary.physicalAddress}
   Allocation: ${beneficiary.allocationPercentage}% of total digital assets
`).join('\n')}

SECTION 3: DISTRIBUTION INSTRUCTIONS

Upon my death, I direct that my digital assets be distributed to the above-named beneficiaries according to the specified percentages. The distribution should be made to their designated Ethereum addresses or other compatible blockchain addresses.

SECTION 4: LEGAL DISCLAIMERS

This addendum is intended to supplement, not replace, my primary Last Will and Testament. I acknowledge that:

1. Digital asset laws vary by jurisdiction and continue to evolve
2. Technical challenges may affect asset recovery
3. Private keys or seed phrases may be required for asset access
4. Professional legal and technical assistance is recommended
5. The LastWish.eth platform provides tools but not legal advice

Date: ${currentDate}

---

IMPORTANT NOTICE: This document is generated by LastWish.eth, a digital asset inheritance planning tool. This is not a substitute for professional legal advice. Please consult with an attorney familiar with digital asset inheritance laws in your jurisdiction.

Document ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
`

    setWillDocument(willText)
  }

  const downloadPDF = () => {
    const element = document.createElement('a')
    const file = new Blob([willDocument], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `LastWish-Will-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const printDocument = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>LastWish.eth - Digital Asset Will</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
              h1 { text-align: center; color: #333; }
              .content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <div class="content">${willDocument}</div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const generateMockAddress = (blockchain: string) => {
    const prefixes: Record<string, string> = {
      ethereum: '0x',
      polygon: '0x',
      solana: '',
      bitcoin: 'bc1',
    }
    
    const prefix = prefixes[blockchain] || '0x'
    const chars = '0123456789abcdef'
    let address = prefix
    
    for (let i = prefix.length; i < 42; i++) {
      address += chars[Math.floor(Math.random() * chars.length)]
    }
    
    return address
  }

  const generateMockAssets = (blockchain: string): Asset[] => {
    const assetsByChain: Record<string, Asset[]> = {
      ethereum: [
        { symbol: 'ETH', name: 'Ethereum', balance: (Math.random() * 5).toFixed(3), type: 'NATIVE' },
        { symbol: 'USDC', name: 'USD Coin', balance: (Math.random() * 1000).toFixed(2), type: 'TOKEN' },
        { symbol: 'UNI', name: 'Uniswap', balance: (Math.random() * 100).toFixed(2), type: 'TOKEN' }
      ],
      solana: [
        { symbol: 'SOL', name: 'Solana', balance: (Math.random() * 50).toFixed(3), type: 'NATIVE' },
        { symbol: 'USDC', name: 'USD Coin', balance: (Math.random() * 500).toFixed(2), type: 'TOKEN' }
      ],
      bitcoin: [
        { symbol: 'BTC', name: 'Bitcoin', balance: (Math.random() * 0.5).toFixed(6), type: 'NATIVE' }
      ],
      polygon: [
        { symbol: 'MATIC', name: 'Polygon', balance: (Math.random() * 1000).toFixed(2), type: 'NATIVE' },
        { symbol: 'USDC', name: 'USD Coin', balance: (Math.random() * 500).toFixed(2), type: 'TOKEN' }
      ]
    }

    return assetsByChain[blockchain] || []
  }

  const totalAllocation = beneficiaries.reduce((sum, b) => sum + b.allocationPercentage, 0)

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              LastWish.eth
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Demo Mode - No Database Required
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Secure crypto asset discovery and inheritance planning
          </p>
        </header>

        <Tabs defaultValue="wallets" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wallets" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              My Wallets
            </TabsTrigger>
            <TabsTrigger value="beneficiaries" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Beneficiaries
            </TabsTrigger>
            <TabsTrigger value="will" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Generate Will
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Connect New Wallet (Demo)
                </CardTitle>
                <CardDescription>
                  Simulate connecting and verifying ownership of your cryptocurrency wallets
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

                  <Button onClick={connectWallet} disabled={!selectedBlockchain || !selectedWallet}>
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connected Wallets</CardTitle>
                <CardDescription>
                  Your simulated cryptocurrency wallets and discovered assets
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
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            ✓ Verified
                          </Badge>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Discovered Assets:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {wallet.assets.map((asset, index) => (
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
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="beneficiaries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Add Beneficiary
                </CardTitle>
                <CardDescription>
                  Add people who will inherit your cryptocurrency assets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="fullName">Full Legal Name *</Label>
                    <Input
                      id="fullName"
                      value={beneficiaryForm.fullName}
                      onChange={(e) => setBeneficiaryForm({...beneficiaryForm, fullName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="relationship">Relationship *</Label>
                    <Input
                      id="relationship"
                      value={beneficiaryForm.relationship}
                      onChange={(e) => setBeneficiaryForm({...beneficiaryForm, relationship: e.target.value})}
                      placeholder="e.g., Spouse, Child, Parent"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ethAddress">Ethereum Address or ENS Name *</Label>
                    <Input
                      id="ethAddress"
                      value={beneficiaryForm.ethAddress}
                      onChange={(e) => setBeneficiaryForm({...beneficiaryForm, ethAddress: e.target.value})}
                      placeholder="0x... or name.eth"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={beneficiaryForm.phoneNumber}
                      onChange={(e) => setBeneficiaryForm({...beneficiaryForm, phoneNumber: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={beneficiaryForm.email}
                      onChange={(e) => setBeneficiaryForm({...beneficiaryForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="physicalAddress">Physical Address *</Label>
                    <Input
                      id="physicalAddress"
                      value={beneficiaryForm.physicalAddress}
                      onChange={(e) => setBeneficiaryForm({...beneficiaryForm, physicalAddress: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <Button onClick={addBeneficiary} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Beneficiary
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Beneficiaries ({beneficiaries.length})</CardTitle>
                <CardDescription>
                  Total Allocation: {totalAllocation.toFixed(1)}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                {beneficiaries.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No beneficiaries added yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {beneficiaries.map((beneficiary) => (
                      <div key={beneficiary.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-lg">{beneficiary.fullName}</h3>
                          <Badge variant="secondary">
                            {beneficiary.allocationPercentage.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <p><strong>Relationship:</strong> {beneficiary.relationship}</p>
                          <p><strong>ETH Address:</strong> {beneficiary.ethAddress.slice(0, 10)}...{beneficiary.ethAddress.slice(-8)}</p>
                          <p><strong>Email:</strong> {beneficiary.email}</p>
                          <p><strong>Phone:</strong> {beneficiary.phoneNumber}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="will" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generate Will Document
                </CardTitle>
                <CardDescription>
                  Create a legal document for your cryptocurrency inheritance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-medium mb-2">Requirements:</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {connectedWallets.length > 0 ? '✅' : '❌'} At least one wallet connected ({connectedWallets.length})
                      </div>
                      <div className="flex items-center gap-2">
                        {beneficiaries.length > 0 ? '✅' : '❌'} At least one beneficiary added ({beneficiaries.length})
                      </div>
                      <div className="flex items-center gap-2">
                        {Math.abs(totalAllocation - 100) < 0.1 ? '✅' : '❌'} Allocations total 100% ({totalAllocation.toFixed(1)}%)
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={generateWill}
                    disabled={connectedWallets.length === 0 || beneficiaries.length === 0}
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Will Document
                  </Button>

                  {willDocument && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Button onClick={downloadPDF} variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button onClick={printDocument} variant="outline">
                          <Printer className="h-4 w-4 mr-2" />
                          Print
                        </Button>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle>Document Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded border max-h-96 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm">
                              {willDocument}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Privacy
                </CardTitle>
                <CardDescription>
                  Demo mode - all data is stored locally in your browser
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">
                      🔒 Demo Mode Security
                    </h3>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• All data is stored locally in your browser</li>
                      <li>• No real wallet connections or signatures</li>
                      <li>• Mock data for demonstration purposes</li>
                      <li>• No server-side storage or database</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      🛡️ Production Features
                    </h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Real wallet signature verification</li>
                      <li>• Encrypted database storage</li>
                      <li>• Multi-blockchain asset discovery</li>
                      <li>• Legal document generation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

