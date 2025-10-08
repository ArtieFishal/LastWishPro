import jsPDF from 'jspdf'

// Define the types that were missing
export interface EstateData {
  id: string
  userId: string
  title: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface BeneficiaryData {
  id: string
  estateId: string
  name: string
  email: string
  relationship: string
  percentage: number
  walletAddress?: string
}

export interface DigitalAsset {
  id: string
  estateId: string
  type: string
  name: string
  value: number
  description: string
  walletAddress?: string
}

// Legal document templates for different states
const LEGAL_TEMPLATES = {
  'CA': {
    title: 'California Digital Asset Will',
    template: 'California-specific digital asset will template...'
  },
  'NY': {
    title: 'New York Digital Asset Will',
    template: 'New York-specific digital asset will template...'
  },
  'TX': {
    title: 'Texas Digital Asset Will',
    template: 'Texas-specific digital asset will template...'
  }
}

export const generateEstatePDF = async (
  estate: EstateData,
  beneficiaries: BeneficiaryData[],
  assets: DigitalAsset[]
): Promise<Blob> => {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(20)
  doc.text('Digital Estate Plan', 20, 30)
  
  // Add estate information
  doc.setFontSize(12)
  doc.text(`Estate: ${estate.title}`, 20, 50)
  doc.text(`Description: ${estate.description}`, 20, 60)
  
  // Add beneficiaries
  doc.text('Beneficiaries:', 20, 80)
  beneficiaries.forEach((beneficiary, index) => {
    const y = 90 + (index * 20)
    doc.text(`${beneficiary.name} - ${beneficiary.percentage}%`, 30, y)
  })
  
  // Add assets
  doc.text('Digital Assets:', 20, 120)
  assets.forEach((asset, index) => {
    const y = 130 + (index * 20)
    doc.text(`${asset.name} - ${asset.type}`, 30, y)
  })
  
  return doc.output('blob')
}
