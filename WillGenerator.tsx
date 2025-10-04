'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Eye, Printer, CheckCircle, AlertCircle } from 'lucide-react'
import jsPDF from 'jspdf'

interface WillDocument {
  id: string
  legalText: string
  generatedAt: string
  version: number
}

export default function WillGenerator() {
  const { data: session } = useSession()
  const [willDocument, setWillDocument] = useState<WillDocument | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const generateWill = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/will/generate', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setWillDocument(data.willDocument)
        setShowPreview(true)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to generate will')
      }
    } catch (error) {
      console.error('Failed to generate will:', error)
      alert('Failed to generate will. Please ensure you have connected wallets and added beneficiaries.')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPDF = () => {
    if (!willDocument) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - 2 * margin

    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('DIGITAL ASSET INHERITANCE ADDENDUM', pageWidth / 2, 30, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('LastWish.eth Platform', pageWidth / 2, 40, { align: 'center' })

    // Content
    doc.setFontSize(10)
    const lines = doc.splitTextToSize(willDocument.legalText, maxWidth)
    doc.text(lines, margin, 60)

    // Save
    doc.save(`LastWish-Will-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const printDocument = () => {
    if (!willDocument) return

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>LastWish.eth - Digital Asset Will</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
              h1 { text-align: center; color: #333; }
              .header { text-align: center; margin-bottom: 40px; }
              .content { white-space: pre-wrap; }
              @media print {
                body { margin: 20px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>DIGITAL ASSET INHERITANCE ADDENDUM</h1>
              <p>LastWish.eth Platform</p>
            </div>
            <div class="content">${willDocument.legalText}</div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const fetchExistingWill = async () => {
    try {
      const response = await fetch('/api/will/generate')
      if (response.ok) {
        const data = await response.json()
        setWillDocument(data.willDocument)
      }
    } catch (error) {
      console.error('Failed to fetch existing will:', error)
    }
  }

  useEffect(() => {
    if (session) {
      fetchExistingWill()
    }
  }, [session])

  return (
    <div className="space-y-6">
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
            {/* Requirements Check */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium mb-2">Requirements Checklist:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>At least one verified wallet connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>At least one beneficiary added</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Beneficiary allocations total 100%</span>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex gap-4">
              <Button 
                onClick={generateWill}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Will...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    {willDocument ? 'Regenerate Will' : 'Generate Will'}
                  </>
                )}
              </Button>
              
              {willDocument && (
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Hide Preview' : 'Preview'}
                </Button>
              )}
            </div>

            {/* Document Actions */}
            {willDocument && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Your Will Document</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Generated on {new Date(willDocument.generatedAt).toLocaleDateString()}
                      {' • Version '}{willDocument.version}
                    </p>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ready
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button onClick={downloadPDF} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button onClick={printDocument} variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            )}

            {/* Document Preview */}
            {willDocument && showPreview && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Document Preview</CardTitle>
                  <CardDescription>
                    Review your will document before printing or downloading
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded border max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {willDocument.legalText}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Legal Disclaimer */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                    Important Legal Notice
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    This document is generated by LastWish.eth as a supplementary tool for digital asset inheritance planning. 
                    It is not a substitute for professional legal advice. Please consult with an attorney familiar with 
                    digital asset inheritance laws in your jurisdiction to ensure this document is properly integrated 
                    with your complete estate planning documents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

