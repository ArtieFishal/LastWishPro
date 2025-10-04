import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Download, 
  Eye, 
  Plus, 
  Trash2, 
  Edit3,
  Save,
  AlertCircle,
  CheckCircle,
  Users,
  Wallet,
  DollarSign,
  Calendar,
  Shield,
  Printer
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext'
import { useWeb3 } from '@/contexts/Web3Context'
import { usePayment } from '@/contexts/PaymentContext'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export function AddendumPage() {
  const { user } = useAuth()
  const { sessions } = useWallet()
  const { connectedWallets } = useWeb3()
  const { hasPaid } = usePayment()
  console.log('hasPaid:', hasPaid);
  
  const [currentStep, setCurrentStep] = useState(1)
  const [addendumData, setAddendumData] = useState({
    // Personal Information
    testatorName: '',
    testatorAddress: '',
    testatorCity: '',
    testatorState: '',
    testatorZip: '',
    testatorCountry: 'United States',
    
    // Document Information
    originalWillDate: '',
    originalWillLocation: '',
    addendumTitle: 'Cryptocurrency Assets Addendum',
    addendumDate: new Date().toISOString().split('T')[0],
    
    // Assets and Beneficiaries
    cryptoAssets: [],
    beneficiaries: [],
    
    // Legal Provisions
    executorName: '',
    executorRelationship: '',
    executorContact: '',
    witnessRequirements: true,
    notarizationRequired: true,
    
    // Additional Instructions
    specialInstructions: '',
    accessInstructions: '',
    emergencyContact: '',
    
    // Metadata
    createdAt: new Date().toISOString(),
    version: '1.0'
  })
  
  const [previewMode, setPreviewMode] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // Load user data and connected wallets on mount
  useEffect(() => {
    if (user) {
      setAddendumData(prev => ({
        ...prev,
        testatorName: user.full_name || '',
        testatorAddress: user.address || '',
        testatorCity: user.city || '',
        testatorState: user.state || '',
        testatorZip: user.zip_code || '',
        executorContact: user.email || ''
      }))
    }
  }, [user])

  // Load crypto assets from connected wallets
  useEffect(() => {
    const loadCryptoAssets = () => {
      const assets = []
      
      // Add assets from Web3 wallets
      connectedWallets.forEach(wallet => {
        assets.push({
          id: `web3-${wallet.id}`,
          type: 'wallet',
          description: `${wallet.name} Wallet`,
          address: wallet.address,
          network: wallet.network.name,
          estimatedValue: wallet.balance?.formatted || '0',
          currency: wallet.balance?.symbol || 'ETH',
          beneficiaryId: null,
          percentage: 100,
          accessMethod: 'Private key or seed phrase (stored separately)',
          specialInstructions: ''
        })
      })
      
      // Add assets from backend wallet sessions
      sessions.forEach(session => {
        if (session.assets) {
          session.assets.forEach(asset => {
            assets.push({
              id: `session-${session.id}-${asset.symbol}`,
              type: 'asset',
              description: `${asset.name} (${asset.symbol})`,
              address: session.address,
              network: session.blockchain,
              estimatedValue: asset.balance || '0',
              currency: asset.symbol,
              beneficiaryId: null,
              percentage: 100,
              accessMethod: 'Private key or seed phrase (stored separately)',
              specialInstructions: ''
            })
          })
        }
      })
      
      setAddendumData(prev => ({
        ...prev,
        cryptoAssets: assets
      }))
    }
    
    loadCryptoAssets()
  }, [connectedWallets, sessions])

  // Validation function
  const validateStep = (step) => {
    const errors = {}
    
    switch (step) {
      case 1: // Personal Information
        if (!addendumData.testatorName) errors.testatorName = 'Full name is required'
        if (!addendumData.testatorAddress) errors.testatorAddress = 'Address is required'
        if (!addendumData.testatorCity) errors.testatorCity = 'City is required'
        if (!addendumData.testatorState) errors.testatorState = 'State is required'
        break
        
      case 2: // Document Information
        if (!addendumData.originalWillDate) errors.originalWillDate = 'Original will date is required'
        if (!addendumData.originalWillLocation) errors.originalWillLocation = 'Original will location is required'
        break
        
      case 3: // Assets and Beneficiaries
        if (addendumData.cryptoAssets.length === 0) errors.cryptoAssets = 'At least one crypto asset is required'
        if (addendumData.beneficiaries.length === 0) errors.beneficiaries = 'At least one beneficiary is required'
        break
        
      case 4: // Legal Provisions
        if (!addendumData.executorName) errors.executorName = 'Executor name is required'
        if (!addendumData.executorRelationship) errors.executorRelationship = 'Executor relationship is required'
        break
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form updates
  const updateAddendumData = (field, value) => {
    setAddendumData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Add beneficiary
  const addBeneficiary = () => {
    const newBeneficiary = {
      id: Date.now().toString(),
      name: '',
      relationship: '',
      address: '',
      email: '',
      phone: '',
      percentage: 0,
      contingent: false
    }
    
    setAddendumData(prev => ({
      ...prev,
      beneficiaries: [...prev.beneficiaries, newBeneficiary]
    }))
  }

  // Update beneficiary
  const updateBeneficiary = (id, field, value) => {
    setAddendumData(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.map(b => 
        b.id === id ? { ...b, [field]: value } : b
      )
    }))
  }

  // Remove beneficiary
  const removeBeneficiary = (id) => {
    setAddendumData(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter(b => b.id !== id)
    }))
  }

  // Update crypto asset
  const updateCryptoAsset = (id, field, value) => {
    setAddendumData(prev => ({
      ...prev,
      cryptoAssets: prev.cryptoAssets.map(asset => 
        asset.id === id ? { ...asset, [field]: value } : asset
      )
    }))
  }

  // Generate PDF
  const generatePDF = async () => {
    setIsGenerating(true)
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      let yPosition = margin
      
      // Helper function to add text with word wrap
      const addText = (text, fontSize = 12, isBold = false) => {
        pdf.setFontSize(fontSize)
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal')
        
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin)
        
        lines.forEach(line => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage()
            yPosition = margin
          }
          pdf.text(line, margin, yPosition)
          yPosition += fontSize * 0.5
        })
        
        yPosition += 5 // Add some spacing
      }
      
      // Document Header
      addText('ADDENDUM TO LAST WILL AND TESTAMENT', 16, true)
      addText('REGARDING CRYPTOCURRENCY ASSETS', 14, true)
      yPosition += 10
      
      // Testator Information
      addText('TESTATOR INFORMATION', 14, true)
      addText(`Name: ${addendumData.testatorName}`)
      addText(`Address: ${addendumData.testatorAddress}`)
      addText(`City, State, ZIP: ${addendumData.testatorCity}, ${addendumData.testatorState} ${addendumData.testatorZip}`)
      addText(`Country: ${addendumData.testatorCountry}`)
      yPosition += 10
      
      // Original Will Reference
      addText('ORIGINAL WILL REFERENCE', 14, true)
      addText(`Original Will Date: ${addendumData.originalWillDate}`)
      addText(`Original Will Location: ${addendumData.originalWillLocation}`)
      yPosition += 10
      
      // Cryptocurrency Assets
      addText('CRYPTOCURRENCY ASSETS', 14, true)
      addText('I hereby add the following cryptocurrency assets to my estate:')
      yPosition += 5
      
      addendumData.cryptoAssets.forEach((asset, index) => {
        addText(`${index + 1}. ${asset.description}`)
        addText(`   Network: ${asset.network}`)
        addText(`   Address: ${asset.address}`)
        addText(`   Estimated Value: ${asset.estimatedValue} ${asset.currency}`)
        addText(`   Access Method: ${asset.accessMethod}`)
        if (asset.specialInstructions) {
          addText(`   Special Instructions: ${asset.specialInstructions}`)
        }
        yPosition += 5
      })
      
      // Beneficiaries
      addText('BENEFICIARIES', 14, true)
      addText('I direct that the above cryptocurrency assets be distributed as follows:')
      yPosition += 5
      
      addendumData.beneficiaries.forEach((beneficiary, index) => {
        addText(`${index + 1}. ${beneficiary.name} (${beneficiary.relationship})`)
        addText(`   Address: ${beneficiary.address}`)
        addText(`   Email: ${beneficiary.email}`)
        addText(`   Percentage: ${beneficiary.percentage}%`)
        if (beneficiary.contingent) {
          addText(`   Status: Contingent Beneficiary`)
        }
        yPosition += 5
      })
      
      // Executor Information
      addText('EXECUTOR INFORMATION', 14, true)
      addText(`Executor Name: ${addendumData.executorName}`)
      addText(`Relationship: ${addendumData.executorRelationship}`)
      addText(`Contact: ${addendumData.executorContact}`)
      yPosition += 10
      
      // Special Instructions
      if (addendumData.specialInstructions) {
        addText('SPECIAL INSTRUCTIONS', 14, true)
        addText(addendumData.specialInstructions)
        yPosition += 10
      }
      
      // Access Instructions
      if (addendumData.accessInstructions) {
        addText('ACCESS INSTRUCTIONS', 14, true)
        addText(addendumData.accessInstructions)
        yPosition += 10
      }
      
      // Legal Provisions
      addText('LEGAL PROVISIONS', 14, true)
      addText('This addendum is intended to supplement and not replace my existing Last Will and Testament. In the event of any conflict between this addendum and my original will, this addendum shall control with respect to the cryptocurrency assets listed herein.')
      yPosition += 10
      
      // Signature Section
      addText('SIGNATURES', 14, true)
      addText('Testator Signature: ___________________________ Date: ___________')
      yPosition += 15
      addText(`${addendumData.testatorName}`)
      yPosition += 20
      
      if (addendumData.witnessRequirements) {
        addText('WITNESSES', 14, true)
        addText('Witness 1 Signature: ___________________________ Date: ___________')
        yPosition += 10
        addText('Print Name: ___________________________')
        yPosition += 15
        
        addText('Witness 2 Signature: ___________________________ Date: ___________')
        yPosition += 10
        addText('Print Name: ___________________________')
        yPosition += 15
      }
      
      if (addendumData.notarizationRequired) {
        addText('NOTARIZATION', 14, true)
        addText('State of: ___________________________')
        addText('County of: ___________________________')
        yPosition += 10
        addText('Notary Public Signature: ___________________________')
        addText('My commission expires: ___________________________')
        addText('Notary Seal:')
      }
      
      // Footer
      pdf.setFontSize(10)
      pdf.text(`Generated on ${new Date().toLocaleDateString()} by Last Wish Platform`, margin, pageHeight - 10)
      
      // Save the PDF
      const fileName = `cryptocurrency-addendum-${addendumData.testatorName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      toast.success('PDF generated successfully!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  // Navigation functions
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const steps = [
    { number: 1, title: 'Personal Information', icon: Users },
    { number: 2, title: 'Document Information', icon: FileText },
    { number: 3, title: 'Assets & Beneficiaries', icon: Wallet },
    { number: 4, title: 'Legal Provisions', icon: Shield },
    { number: 5, title: 'Review & Generate', icon: CheckCircle }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Cryptocurrency Addendum</h1>
          <p className="text-gray-400">Create a legally binding addendum to your will for cryptocurrency assets.</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => setPreviewMode(!previewMode)}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          {!hasPaid && (
            <div className="text-right text-yellow-400 text-sm">
              Please make a payment to enable PDF generation.
            </div>
          )}
          <Button 
            onClick={generatePDF}
            disabled={isGenerating || currentStep < 5 || !hasPaid}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : isActive 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'border-gray-600 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      Step {step.number}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-blue-400' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {!previewMode && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">
              {steps[currentStep - 1]?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Full Legal Name *</Label>
                    <Input
                      value={addendumData.testatorName}
                      onChange={(e) => updateAddendumData('testatorName', e.target.value)}
                      placeholder="Enter your full legal name"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    {validationErrors.testatorName && (
                      <p className="text-red-400 text-sm mt-1">{validationErrors.testatorName}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-gray-400">Street Address *</Label>
                    <Input
                      value={addendumData.testatorAddress}
                      onChange={(e) => updateAddendumData('testatorAddress', e.target.value)}
                      placeholder="Enter your street address"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    {validationErrors.testatorAddress && (
                      <p className="text-red-400 text-sm mt-1">{validationErrors.testatorAddress}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-400">City *</Label>
                    <Input
                      value={addendumData.testatorCity}
                      onChange={(e) => updateAddendumData('testatorCity', e.target.value)}
                      placeholder="City"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    {validationErrors.testatorCity && (
                      <p className="text-red-400 text-sm mt-1">{validationErrors.testatorCity}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-gray-400">State *</Label>
                    <Input
                      value={addendumData.testatorState}
                      onChange={(e) => updateAddendumData('testatorState', e.target.value)}
                      placeholder="State"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    {validationErrors.testatorState && (
                      <p className="text-red-400 text-sm mt-1">{validationErrors.testatorState}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-gray-400">ZIP Code</Label>
                    <Input
                      value={addendumData.testatorZip}
                      onChange={(e) => updateAddendumData('testatorZip', e.target.value)}
                      placeholder="ZIP Code"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Document Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Original Will Date *</Label>
                    <Input
                      type="date"
                      value={addendumData.originalWillDate}
                      onChange={(e) => updateAddendumData('originalWillDate', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    {validationErrors.originalWillDate && (
                      <p className="text-red-400 text-sm mt-1">{validationErrors.originalWillDate}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-gray-400">Addendum Date</Label>
                    <Input
                      type="date"
                      value={addendumData.addendumDate}
                      onChange={(e) => updateAddendumData('addendumDate', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-400">Original Will Location *</Label>
                  <Input
                    value={addendumData.originalWillLocation}
                    onChange={(e) => updateAddendumData('originalWillLocation', e.target.value)}
                    placeholder="e.g., Safe deposit box at First National Bank, Attorney's office, etc."
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  {validationErrors.originalWillLocation && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.originalWillLocation}</p>
                  )}
                </div>
                
                <div>
                  <Label className="text-gray-400">Addendum Title</Label>
                  <Input
                    value={addendumData.addendumTitle}
                    onChange={(e) => updateAddendumData('addendumTitle', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Assets & Beneficiaries */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Crypto Assets */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Cryptocurrency Assets</h3>
                    <Badge variant="outline" className="border-blue-500 text-blue-400">
                      {addendumData.cryptoAssets.length} assets detected
                    </Badge>
                  </div>
                  
                  {addendumData.cryptoAssets.length > 0 ? (
                    <div className="space-y-3">
                      {addendumData.cryptoAssets.map((asset) => (
                        <Card key={asset.id} className="bg-gray-800 border-gray-700">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="text-white font-medium">{asset.description}</h4>
                                <p className="text-gray-400 text-sm">{asset.network} • {asset.address}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-white">{asset.estimatedValue} {asset.currency}</p>
                                <p className="text-gray-400 text-sm">Estimated Value</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-gray-400 text-xs">Access Method</Label>
                                <Textarea
                                  value={asset.accessMethod}
                                  onChange={(e) => updateCryptoAsset(asset.id, 'accessMethod', e.target.value)}
                                  placeholder="How should this asset be accessed?"
                                  className="bg-gray-700 border-gray-600 text-white text-sm"
                                  rows={2}
                                />
                              </div>
                              
                              <div>
                                <Label className="text-gray-400 text-xs">Special Instructions</Label>
                                <Textarea
                                  value={asset.specialInstructions}
                                  onChange={(e) => updateCryptoAsset(asset.id, 'specialInstructions', e.target.value)}
                                  placeholder="Any special instructions for this asset"
                                  className="bg-gray-700 border-gray-600 text-white text-sm"
                                  rows={2}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wallet className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No cryptocurrency assets detected.</p>
                      <p className="text-gray-500 text-sm">Connect your wallets in the Wallets section to automatically detect assets.</p>
                    </div>
                  )}
                  
                  {validationErrors.cryptoAssets && (
                    <p className="text-red-400 text-sm">{validationErrors.cryptoAssets}</p>
                  )}
                </div>

                <Separator className="bg-gray-700" />

                {/* Beneficiaries */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Beneficiaries</h3>
                    <Button
                      onClick={addBeneficiary}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Beneficiary
                    </Button>
                  </div>
                  
                  {addendumData.beneficiaries.length > 0 ? (
                    <div className="space-y-4">
                      {addendumData.beneficiaries.map((beneficiary) => (
                        <Card key={beneficiary.id} className="bg-gray-800 border-gray-700">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-white font-medium">Beneficiary {addendumData.beneficiaries.indexOf(beneficiary) + 1}</h4>
                              <Button
                                onClick={() => removeBeneficiary(beneficiary.id)}
                                size="sm"
                                variant="destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-gray-400 text-xs">Full Name</Label>
                                <Input
                                  value={beneficiary.name}
                                  onChange={(e) => updateBeneficiary(beneficiary.id, 'name', e.target.value)}
                                  placeholder="Beneficiary's full name"
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-gray-400 text-xs">Relationship</Label>
                                <Input
                                  value={beneficiary.relationship}
                                  onChange={(e) => updateBeneficiary(beneficiary.id, 'relationship', e.target.value)}
                                  placeholder="e.g., Spouse, Child, Sibling"
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-gray-400 text-xs">Email</Label>
                                <Input
                                  type="email"
                                  value={beneficiary.email}
                                  onChange={(e) => updateBeneficiary(beneficiary.id, 'email', e.target.value)}
                                  placeholder="Email address"
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-gray-400 text-xs">Percentage (%)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={beneficiary.percentage}
                                  onChange={(e) => updateBeneficiary(beneficiary.id, 'percentage', parseInt(e.target.value) || 0)}
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <Label className="text-gray-400 text-xs">Address</Label>
                              <Textarea
                                value={beneficiary.address}
                                onChange={(e) => updateBeneficiary(beneficiary.id, 'address', e.target.value)}
                                placeholder="Full mailing address"
                                className="bg-gray-700 border-gray-600 text-white"
                                rows={2}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No beneficiaries added yet.</p>
                      <Button
                        onClick={addBeneficiary}
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Beneficiary
                      </Button>
                    </div>
                  )}
                  
                  {validationErrors.beneficiaries && (
                    <p className="text-red-400 text-sm">{validationErrors.beneficiaries}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Legal Provisions */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Executor Name *</Label>
                    <Input
                      value={addendumData.executorName}
                      onChange={(e) => updateAddendumData('executorName', e.target.value)}
                      placeholder="Full name of executor"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    {validationErrors.executorName && (
                      <p className="text-red-400 text-sm mt-1">{validationErrors.executorName}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-gray-400">Relationship to You *</Label>
                    <Input
                      value={addendumData.executorRelationship}
                      onChange={(e) => updateAddendumData('executorRelationship', e.target.value)}
                      placeholder="e.g., Spouse, Attorney, Friend"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    {validationErrors.executorRelationship && (
                      <p className="text-red-400 text-sm mt-1">{validationErrors.executorRelationship}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-400">Executor Contact Information</Label>
                  <Input
                    value={addendumData.executorContact}
                    onChange={(e) => updateAddendumData('executorContact', e.target.value)}
                    placeholder="Email, phone, or address"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-400">Special Instructions</Label>
                  <Textarea
                    value={addendumData.specialInstructions}
                    onChange={(e) => updateAddendumData('specialInstructions', e.target.value)}
                    placeholder="Any special instructions for handling your cryptocurrency assets"
                    className="bg-gray-800 border-gray-700 text-white"
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label className="text-gray-400">Access Instructions</Label>
                  <Textarea
                    value={addendumData.accessInstructions}
                    onChange={(e) => updateAddendumData('accessInstructions', e.target.value)}
                    placeholder="Instructions for accessing private keys, seed phrases, or hardware wallets"
                    className="bg-gray-800 border-gray-700 text-white"
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label className="text-gray-400">Emergency Contact</Label>
                  <Input
                    value={addendumData.emergencyContact}
                    onChange={(e) => updateAddendumData('emergencyContact', e.target.value)}
                    placeholder="Emergency contact for cryptocurrency matters"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Review & Generate */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <h3 className="text-green-400 font-medium">Ready to Generate</h3>
                  </div>
                  <p className="text-green-300 text-sm">
                    Your cryptocurrency addendum is ready to be generated. Please review the summary below and click "Generate PDF" to create your legal document.
                  </p>
                </div>
                
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Document Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-gray-400 text-sm">Testator</Label>
                        <p className="text-white">{addendumData.testatorName}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400 text-sm">Original Will Date</Label>
                        <p className="text-white">{addendumData.originalWillDate}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400 text-sm">Executor</Label>
                        <p className="text-white">{addendumData.executorName}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400 text-sm">Assets</Label>
                        <p className="text-white">{addendumData.cryptoAssets.length} cryptocurrency assets</p>
                      </div>
                      <div>
                        <Label className="text-gray-400 text-sm">Beneficiaries</Label>
                        <p className="text-white">{addendumData.beneficiaries.length} beneficiaries</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                        <div>
                          <p className="text-white text-sm font-medium">Generate PDF</p>
                          <p className="text-gray-400 text-xs">Download your addendum document</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                        <div>
                          <p className="text-white text-sm font-medium">Print & Sign</p>
                          <p className="text-gray-400 text-xs">Print the document and sign in the presence of witnesses</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                        <div>
                          <p className="text-white text-sm font-medium">Notarize</p>
                          <p className="text-gray-400 text-xs">Have the document notarized according to your state's requirements</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                        <div>
                          <p className="text-white text-sm font-medium">Store Safely</p>
                          <p className="text-gray-400 text-xs">Store with your original will and inform your executor</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <h3 className="text-yellow-400 font-medium">Important Legal Notice</h3>
                  </div>
                  <p className="text-yellow-300 text-sm">
                    This addendum is a legal document. Please consult with an attorney familiar with estate planning and cryptocurrency laws in your jurisdiction to ensure compliance with local requirements.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Mode */}
      {previewMode && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Document Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div id="document-preview" className="bg-white text-black p-8 rounded-lg">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">ADDENDUM TO LAST WILL AND TESTAMENT</h1>
                <h2 className="text-xl font-semibold">REGARDING CRYPTOCURRENCY ASSETS</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">TESTATOR INFORMATION</h3>
                  <p>Name: {addendumData.testatorName}</p>
                  <p>Address: {addendumData.testatorAddress}</p>
                  <p>City, State, ZIP: {addendumData.testatorCity}, {addendumData.testatorState} {addendumData.testatorZip}</p>
                  <p>Country: {addendumData.testatorCountry}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">ORIGINAL WILL REFERENCE</h3>
                  <p>Original Will Date: {addendumData.originalWillDate}</p>
                  <p>Original Will Location: {addendumData.originalWillLocation}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">CRYPTOCURRENCY ASSETS</h3>
                  <p className="mb-3">I hereby add the following cryptocurrency assets to my estate:</p>
                  {addendumData.cryptoAssets.map((asset, index) => (
                    <div key={asset.id} className="mb-3 pl-4">
                      <p className="font-medium">{index + 1}. {asset.description}</p>
                      <p className="text-sm">Network: {asset.network}</p>
                      <p className="text-sm">Address: {asset.address}</p>
                      <p className="text-sm">Estimated Value: {asset.estimatedValue} {asset.currency}</p>
                      <p className="text-sm">Access Method: {asset.accessMethod}</p>
                      {asset.specialInstructions && (
                        <p className="text-sm">Special Instructions: {asset.specialInstructions}</p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">BENEFICIARIES</h3>
                  <p className="mb-3">I direct that the above cryptocurrency assets be distributed as follows:</p>
                  {addendumData.beneficiaries.map((beneficiary, index) => (
                    <div key={beneficiary.id} className="mb-3 pl-4">
                      <p className="font-medium">{index + 1}. {beneficiary.name} ({beneficiary.relationship})</p>
                      <p className="text-sm">Address: {beneficiary.address}</p>
                      <p className="text-sm">Email: {beneficiary.email}</p>
                      <p className="text-sm">Percentage: {beneficiary.percentage}%</p>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">EXECUTOR INFORMATION</h3>
                  <p>Executor Name: {addendumData.executorName}</p>
                  <p>Relationship: {addendumData.executorRelationship}</p>
                  <p>Contact: {addendumData.executorContact}</p>
                </div>
                
                {addendumData.specialInstructions && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">SPECIAL INSTRUCTIONS</h3>
                    <p>{addendumData.specialInstructions}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">SIGNATURES</h3>
                  <div className="space-y-4">
                    <div>
                      <p>Testator Signature: ___________________________ Date: ___________</p>
                      <p className="mt-2">{addendumData.testatorName}</p>
                    </div>
                    
                    {addendumData.witnessRequirements && (
                      <div className="space-y-4">
                        <div>
                          <p>Witness 1 Signature: ___________________________ Date: ___________</p>
                          <p>Print Name: ___________________________</p>
                        </div>
                        <div>
                          <p>Witness 2 Signature: ___________________________ Date: ___________</p>
                          <p>Print Name: ___________________________</p>
                        </div>
                      </div>
                    )}
                    
                    {addendumData.notarizationRequired && (
                      <div>
                        <h4 className="font-semibold">NOTARIZATION</h4>
                        <p>State of: ___________________________</p>
                        <p>County of: ___________________________</p>
                        <p>Notary Public Signature: ___________________________</p>
                        <p>My commission expires: ___________________________</p>
                        <p>Notary Seal:</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      {!previewMode && (
        <div className="flex justify-between">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Previous
          </Button>
          
          <div className="flex gap-3">
            {currentStep < 5 ? (
              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={generatePDF}
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate PDF'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

