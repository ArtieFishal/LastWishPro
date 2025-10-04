import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Download, Eye } from 'lucide-react'

export function AddendumTestSimple() {
  const [testData, setTestData] = useState({
    name: '',
    address: '',
    willDate: ''
  })

  const handleInputChange = (field, value) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateSimplePDF = () => {
    // Simple PDF generation test
    alert('PDF generation would happen here')
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Cryptocurrency Addendum Creator</h1>
          <p className="text-gray-400 text-lg">Create a legal addendum to your will for cryptocurrency assets</p>
        </div>

        {/* Simple Form */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-400">Full Name</Label>
              <Input
                value={testData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full legal name"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div>
              <Label className="text-gray-400">Address</Label>
              <Input
                value={testData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your address"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div>
              <Label className="text-gray-400">Original Will Date</Label>
              <Input
                type="date"
                value={testData.willDate}
                onChange={(e) => handleInputChange('willDate', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button 
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button 
            onClick={generateSimplePDF}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Generate PDF
          </Button>
        </div>

        {/* Preview */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Document Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white text-black p-6 rounded">
              <h2 className="text-xl font-bold text-center mb-4">ADDENDUM TO LAST WILL AND TESTAMENT</h2>
              <h3 className="text-lg font-semibold text-center mb-6">REGARDING CRYPTOCURRENCY ASSETS</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">TESTATOR INFORMATION</h4>
                  <p>Name: {testData.name || '[Name]'}</p>
                  <p>Address: {testData.address || '[Address]'}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">ORIGINAL WILL REFERENCE</h4>
                  <p>Original Will Date: {testData.willDate || '[Date]'}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">CRYPTOCURRENCY ASSETS</h4>
                  <p>I hereby add the following cryptocurrency assets to my estate:</p>
                  <p className="italic">[Assets will be listed here]</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">SIGNATURES</h4>
                  <div className="mt-8">
                    <p>Testator Signature: ___________________________ Date: ___________</p>
                    <p className="mt-2">{testData.name || '[Testator Name]'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

