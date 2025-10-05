import jsPDF from 'jspdf'
import { type EstateData, type BeneficiaryData, type DigitalAsset } from './storage'

// Legal document templates for different states
const LEGAL_TEMPLATES = {
  california: {
    title: 'DIGITAL ASSET ADDENDUM TO WILL',
    state: 'California',
    requirements: [
      'Must be signed by testator',
      'Must be witnessed by two disinterested witnesses',
      'Must be notarized',
      'Must reference the main will document'
    ]
  },
  texas: {
    title: 'DIGITAL ASSET ADDENDUM TO WILL',
    state: 'Texas',
    requirements: [
      'Must be signed by testator',
      'Must be witnessed by two disinterested witnesses',
      'Must be notarized',
      'Must be self-proving affidavit'
    ]
  },
  florida: {
    title: 'DIGITAL ASSET ADDENDUM TO WILL',
    state: 'Florida',
    requirements: [
      'Must be signed by testator',
      'Must be witnessed by two disinterested witnesses',
      'Must be notarized',
      'Must be executed with same formalities as main will'
    ]
  },
  newyork: {
    title: 'DIGITAL ASSET ADDENDUM TO WILL',
    state: 'New York',
    requirements: [
      'Must be signed by testator',
      'Must be witnessed by two disinterested witnesses',
      'Must be notarized',
      'Must be executed with same formalities as main will'
    ]
  }
  // Add more states as needed
}

export class PDFGenerator {
  private doc: jsPDF
  private currentY: number = 20
  private pageHeight: number = 280
  private margin: number = 20

  constructor() {
    this.doc = new jsPDF()
  }

  generateEstateDocument(estate: EstateData): jsPDF {
    this.doc = new jsPDF()
    this.currentY = 20

    // Add header
    this.addHeader(estate)
    
    // Add testator information
    this.addTestatorInfo(estate)
    
    // Add digital assets
    this.addDigitalAssets(estate.assets)
    
    // Add beneficiaries
    this.addBeneficiaries(estate.beneficiaries)
    
    // Add instructions
    this.addInstructions(estate.instructions)
    
    // Add legal requirements
    this.addLegalRequirements(estate.state)
    
    // Add signature section
    this.addSignatureSection()
    
    // Add footer
    this.addFooter()

    return this.doc
  }

  private addHeader(estate: EstateData) {
    const template = LEGAL_TEMPLATES[estate.state.toLowerCase() as keyof typeof LEGAL_TEMPLATES] || LEGAL_TEMPLATES.california
    
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(template.title, this.margin, this.currentY)
    this.currentY += 10

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`State of ${template.state}`, this.margin, this.currentY)
    this.currentY += 10

    this.doc.setFontSize(10)
    this.doc.text(`Date: ${new Date().toLocaleDateString()}`, this.margin, this.currentY)
    this.currentY += 15
  }

  private addTestatorInfo(estate: EstateData) {
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('TESTATOR INFORMATION', this.margin, this.currentY)
    this.currentY += 8

    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`Estate Plan: ${estate.title}`, this.margin, this.currentY)
    this.currentY += 6
    this.doc.text(`Created: ${estate.createdAt.toLocaleDateString()}`, this.margin, this.currentY)
    this.currentY += 6
    this.doc.text(`Last Updated: ${estate.updatedAt.toLocaleDateString()}`, this.margin, this.currentY)
    this.currentY += 15
  }

  private addDigitalAssets(assets: DigitalAsset[]) {
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('DIGITAL ASSETS', this.margin, this.currentY)
    this.currentY += 8

    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')

    if (assets.length === 0) {
      this.doc.text('No digital assets specified.', this.margin, this.currentY)
      this.currentY += 15
      return
    }

    // Group assets by type
    const groupedAssets = this.groupAssetsByType(assets)

    for (const [type, typeAssets] of Object.entries(groupedAssets)) {
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(`${type.toUpperCase()} ASSETS:`, this.margin, this.currentY)
      this.currentY += 6

      this.doc.setFont('helvetica', 'normal')
      
      for (const asset of typeAssets) {
        if (this.currentY > this.pageHeight - 20) {
          this.doc.addPage()
          this.currentY = 20
        }

        this.doc.text(`• ${asset.name} (${asset.symbol})`, this.margin + 10, this.currentY)
        this.currentY += 5
        this.doc.text(`  Balance: ${asset.balance}`, this.margin + 10, this.currentY)
        this.currentY += 4
        this.doc.text(`  Estimated Value: $${asset.estimatedValue.toLocaleString()}`, this.margin + 10, this.currentY)
        this.currentY += 4
        this.doc.text(`  Wallet: ${asset.walletAddress}`, this.margin + 10, this.currentY)
        this.currentY += 4
        this.doc.text(`  Access Instructions: ${asset.accessInstructions}`, this.margin + 10, this.currentY)
        this.currentY += 8
      }
    }
  }

  private addBeneficiaries(beneficiaries: BeneficiaryData[]) {
    if (this.currentY > this.pageHeight - 30) {
      this.doc.addPage()
      this.currentY = 20
    }

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('BENEFICIARIES', this.margin, this.currentY)
    this.currentY += 8

    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')

    if (beneficiaries.length === 0) {
      this.doc.text('No beneficiaries specified.', this.margin, this.currentY)
      this.currentY += 15
      return
    }

    for (const beneficiary of beneficiaries) {
      if (this.currentY > this.pageHeight - 20) {
        this.doc.addPage()
        this.currentY = 20
      }

      this.doc.text(`• ${beneficiary.name}`, this.margin + 10, this.currentY)
      this.currentY += 5
      this.doc.text(`  Relationship: ${beneficiary.relationship}`, this.margin + 10, this.currentY)
      this.currentY += 4
      this.doc.text(`  Email: ${beneficiary.email}`, this.margin + 10, this.currentY)
      this.currentY += 4
      this.doc.text(`  Allocation: ${beneficiary.allocation}%`, this.margin + 10, this.currentY)
      this.currentY += 4
      this.doc.text(`  Access Level: ${beneficiary.accessLevel}`, this.margin + 10, this.currentY)
      this.currentY += 8
    }
  }

  private addInstructions(instructions: string) {
    if (this.currentY > this.pageHeight - 30) {
      this.doc.addPage()
      this.currentY = 20
    }

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('SPECIAL INSTRUCTIONS', this.margin, this.currentY)
    this.currentY += 8

    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    
    if (instructions) {
      const lines = this.doc.splitTextToSize(instructions, 170)
      this.doc.text(lines, this.margin, this.currentY)
      this.currentY += lines.length * 5 + 10
    } else {
      this.doc.text('No special instructions provided.', this.margin, this.currentY)
      this.currentY += 15
    }
  }

  private addLegalRequirements(state: string) {
    if (this.currentY > this.pageHeight - 40) {
      this.doc.addPage()
      this.currentY = 20
    }

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('LEGAL REQUIREMENTS', this.margin, this.currentY)
    this.currentY += 8

    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    
    const template = LEGAL_TEMPLATES[state.toLowerCase() as keyof typeof LEGAL_TEMPLATES] || LEGAL_TEMPLATES.california
    
    this.doc.text(`This addendum must comply with ${template.state} law and meet the following requirements:`, this.margin, this.currentY)
    this.currentY += 8

    for (const requirement of template.requirements) {
      this.doc.text(`• ${requirement}`, this.margin + 10, this.currentY)
      this.currentY += 5
    }
    
    this.currentY += 10
  }

  private addSignatureSection() {
    if (this.currentY > this.pageHeight - 60) {
      this.doc.addPage()
      this.currentY = 20
    }

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('SIGNATURES', this.margin, this.currentY)
    this.currentY += 15

    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    
    // Testator signature
    this.doc.text('Testator Signature:', this.margin, this.currentY)
    this.currentY += 20
    this.doc.line(this.margin, this.currentY, this.margin + 80, this.currentY)
    this.currentY += 5
    this.doc.text('Date: _______________', this.margin, this.currentY)
    this.currentY += 20

    // Witness signatures
    this.doc.text('Witness 1 Signature:', this.margin, this.currentY)
    this.currentY += 20
    this.doc.line(this.margin, this.currentY, this.margin + 80, this.currentY)
    this.currentY += 5
    this.doc.text('Date: _______________', this.margin, this.currentY)
    this.currentY += 20

    this.doc.text('Witness 2 Signature:', this.margin, this.currentY)
    this.currentY += 20
    this.doc.line(this.margin, this.currentY, this.margin + 80, this.currentY)
    this.currentY += 5
    this.doc.text('Date: _______________', this.margin, this.currentY)
    this.currentY += 20

    // Notary section
    this.doc.text('Notary Public:', this.margin, this.currentY)
    this.currentY += 20
    this.doc.line(this.margin, this.currentY, this.margin + 80, this.currentY)
    this.currentY += 5
    this.doc.text('Date: _______________', this.margin, this.currentY)
    this.currentY += 5
    this.doc.text('Notary Seal:', this.margin, this.currentY)
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages()
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      this.doc.setFontSize(8)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(`Last Wish Platform - Digital Estate Planning`, this.margin, 290)
      this.doc.text(`Page ${i} of ${pageCount}`, 150, 290)
      this.doc.text(`Generated on ${new Date().toLocaleDateString()}`, this.margin, 295)
    }
  }

  private groupAssetsByType(assets: DigitalAsset[]): Record<string, DigitalAsset[]> {
    return assets.reduce((groups, asset) => {
      const type = asset.type
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(asset)
      return groups
    }, {} as Record<string, DigitalAsset[]>)
  }

  // Utility method to download the PDF
  downloadPDF(filename: string = 'last-wish-addendum.pdf') {
    this.doc.save(filename)
  }

  // Utility method to get PDF as blob
  getPDFBlob(): Blob {
    return this.doc.output('blob')
  }
}

// Utility functions for PDF generation
export const pdfUtils = {
  generateEstatePDF: (estate: EstateData) => {
    const generator = new PDFGenerator()
    return generator.generateEstateDocument(estate)
  },
  
  downloadEstatePDF: (estate: EstateData, filename?: string) => {
    const generator = new PDFGenerator()
    const doc = generator.generateEstateDocument(estate)
    generator.downloadPDF(filename)
  },
  
  getEstatePDFBlob: (estate: EstateData): Blob => {
    const generator = new PDFGenerator()
    const doc = generator.generateEstateDocument(estate)
    return generator.getPDFBlob()
  }
}