'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Users, Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react'

interface Beneficiary {
  id: string
  fullName: string
  relationship: string
  ethAddress: string
  ensName?: string
  phoneNumber: string
  email: string
  physicalAddress: string
  twitterHandle?: string
  allocationPercentage: number
}

export default function BeneficiaryManager() {
  const { data: session } = useSession()
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    relationship: '',
    ethAddress: '',
    phoneNumber: '',
    email: '',
    physicalAddress: '',
    twitterHandle: '',
    allocationPercentage: 0
  })

  const fetchBeneficiaries = async () => {
    try {
      const response = await fetch('/api/beneficiaries')
      if (response.ok) {
        const data = await response.json()
        setBeneficiaries(data.beneficiaries || [])
      }
    } catch (error) {
      console.error('Failed to fetch beneficiaries:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingBeneficiary ? '/api/beneficiaries' : '/api/beneficiaries'
      const method = editingBeneficiary ? 'PUT' : 'POST'
      const body = editingBeneficiary 
        ? { id: editingBeneficiary.id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        fetchBeneficiaries()
        setIsDialogOpen(false)
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save beneficiary')
      }
    } catch (error) {
      console.error('Failed to save beneficiary:', error)
      alert('Failed to save beneficiary')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this beneficiary?')) return

    try {
      const response = await fetch(`/api/beneficiaries?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchBeneficiaries()
      } else {
        alert('Failed to delete beneficiary')
      }
    } catch (error) {
      console.error('Failed to delete beneficiary:', error)
      alert('Failed to delete beneficiary')
    }
  }

  const resetForm = () => {
    setFormData({
      fullName: '',
      relationship: '',
      ethAddress: '',
      phoneNumber: '',
      email: '',
      physicalAddress: '',
      twitterHandle: '',
      allocationPercentage: 0
    })
    setEditingBeneficiary(null)
  }

  const openEditDialog = (beneficiary: Beneficiary) => {
    setEditingBeneficiary(beneficiary)
    setFormData({
      fullName: beneficiary.fullName,
      relationship: beneficiary.relationship,
      ethAddress: beneficiary.ethAddress,
      phoneNumber: beneficiary.phoneNumber,
      email: beneficiary.email,
      physicalAddress: beneficiary.physicalAddress,
      twitterHandle: beneficiary.twitterHandle || '',
      allocationPercentage: beneficiary.allocationPercentage
    })
    setIsDialogOpen(true)
  }

  const validateEthAddress = (address: string) => {
    if (address.endsWith('.eth')) return true
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const totalAllocation = beneficiaries.reduce((sum, b) => sum + b.allocationPercentage, 0)

  useEffect(() => {
    if (session) {
      fetchBeneficiaries()
    }
  }, [session])

  return (
    <div className="space-y-6">
      {/* Add Beneficiary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Beneficiaries
              </CardTitle>
              <CardDescription>
                Manage who will inherit your cryptocurrency assets
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Beneficiary
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingBeneficiary ? 'Edit Beneficiary' : 'Add New Beneficiary'}
                  </DialogTitle>
                  <DialogDescription>
                    Enter the details of the person who will inherit your crypto assets
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Legal Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="relationship">Relationship *</Label>
                      <Input
                        id="relationship"
                        value={formData.relationship}
                        onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                        placeholder="e.g., Spouse, Child, Parent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ethAddress">Ethereum Address or ENS Name *</Label>
                    <Input
                      id="ethAddress"
                      value={formData.ethAddress}
                      onChange={(e) => setFormData({...formData, ethAddress: e.target.value})}
                      placeholder="0x... or name.eth"
                      required
                    />
                    {formData.ethAddress && !validateEthAddress(formData.ethAddress) && (
                      <p className="text-sm text-red-600 mt-1">
                        Please enter a valid Ethereum address or ENS name
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="physicalAddress">Physical Address *</Label>
                    <Input
                      id="physicalAddress"
                      value={formData.physicalAddress}
                      onChange={(e) => setFormData({...formData, physicalAddress: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="twitterHandle">Twitter Handle (Optional)</Label>
                    <Input
                      id="twitterHandle"
                      value={formData.twitterHandle}
                      onChange={(e) => setFormData({...formData, twitterHandle: e.target.value})}
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <Label htmlFor="allocationPercentage">Allocation Percentage</Label>
                    <Input
                      id="allocationPercentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.allocationPercentage}
                      onChange={(e) => setFormData({...formData, allocationPercentage: parseFloat(e.target.value) || 0})}
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Leave as 0 for automatic equal distribution
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingBeneficiary ? 'Update' : 'Add'} Beneficiary
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Allocation Summary */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Allocation:</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${totalAllocation === 100 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalAllocation.toFixed(2)}%
                </span>
                {totalAllocation === 100 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>
            {totalAllocation !== 100 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Allocation must total 100% to generate a valid will
              </p>
            )}
          </div>

          {beneficiaries.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No beneficiaries added yet. Add your first beneficiary above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {beneficiaries.map((beneficiary) => (
                <div key={beneficiary.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-lg">{beneficiary.fullName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {beneficiary.relationship}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {beneficiary.allocationPercentage}%
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(beneficiary)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(beneficiary.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">ETH Address:</span>
                      <p className="text-gray-600 dark:text-gray-400 break-all">
                        {beneficiary.ensName || beneficiary.ethAddress}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-gray-600 dark:text-gray-400">{beneficiary.email}</p>
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>
                      <p className="text-gray-600 dark:text-gray-400">{beneficiary.phoneNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium">Address:</span>
                      <p className="text-gray-600 dark:text-gray-400">{beneficiary.physicalAddress}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

