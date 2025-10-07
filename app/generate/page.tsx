'use client';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { 
    padding: 32,
    fontSize: 12,
    lineHeight: 1.5
  }, 
  h1: { 
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 'bold'
  }, 
  h2: {
    fontSize: 14,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold'
  },
  p: { 
    fontSize: 12, 
    marginBottom: 6 
  },
  section: {
    marginBottom: 16
  },
  assetItem: {
    marginBottom: 8,
    paddingLeft: 8
  },
  beneficiaryItem: {
    marginBottom: 8,
    paddingLeft: 8
  }
});

function WillDoc() {
  const { state } = useStore();
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Digital Asset Inheritance Addendum</Text>
        <Text style={styles.p}>LastWish.eth Platform</Text>
        <Text style={styles.p}>Generated on: {currentDate}</Text>
        
        <View style={styles.section}>
          <Text style={styles.p}>
            I, {state.owner.fullName}, being of sound mind and disposing memory, do hereby make this Digital Asset Inheritance Addendum to supplement my Last Will and Testament regarding the distribution of my cryptocurrency and digital assets.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>SECTION 1: DIGITAL ASSET INVENTORY</Text>
          <Text style={styles.p}>
            I hereby declare that I own and control the following digital assets through verified wallet addresses:
          </Text>
          
          {state.wallets.map((wallet, index) => (
            <View key={wallet.id} style={styles.assetItem}>
              <Text style={styles.p}>
                {index + 1}. {wallet.blockchain?.toUpperCase() || 'ETHEREUM'} WALLET
              </Text>
              <Text style={styles.p}>   Address: {wallet.address}</Text>
              <Text style={styles.p}>   Wallet Type: {wallet.walletType}</Text>
            </View>
          ))}

          {state.tokens.map((token, index) => (
            <View key={index} style={styles.assetItem}>
              <Text style={styles.p}>
                • {token.balance} {token.symbol} ({token.name})
              </Text>
            </View>
          ))}

          {state.nfts.map((nft, index) => (
            <View key={index} style={styles.assetItem}>
              <Text style={styles.p}>
                • {nft.name || `NFT #${nft.tokenId}`} ({nft.collection})
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>SECTION 2: BENEFICIARY DESIGNATIONS</Text>
          <Text style={styles.p}>
            I hereby designate the following individuals as beneficiaries of my digital assets:
          </Text>
          
          {state.beneficiaries.map((beneficiary, index) => (
            <View key={beneficiary.id} style={styles.beneficiaryItem}>
              <Text style={styles.p}>
                {index + 1}. {beneficiary.name}
              </Text>
              <Text style={styles.p}>   Address: {beneficiary.addressOrEns}</Text>
              {beneficiary.email && <Text style={styles.p}>   Email: {beneficiary.email}</Text>}
              {beneficiary.relationship && <Text style={styles.p}>   Relationship: {beneficiary.relationship}</Text>}
              {beneficiary.phoneNumber && <Text style={styles.p}>   Phone: {beneficiary.phoneNumber}</Text>}
              {beneficiary.physicalAddress && <Text style={styles.p}>   Physical Address: {beneficiary.physicalAddress}</Text>}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>SECTION 3: ASSET ASSIGNMENTS</Text>
          <Text style={styles.p}>
            The following assets shall be distributed according to the specified percentages:
          </Text>
          
          {state.assignments.map((assignment) => (
            <View key={assignment.assetKey} style={styles.assetItem}>
              <Text style={styles.p}>
                {assignment.assetKey}: {assignment.splits.map(s => 
                  `${state.beneficiaries.find(b => b.id === s.beneficiaryId)?.name || 'Unknown'}: ${s.pct}%`
                ).join(', ')}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>SECTION 4: DISTRIBUTION INSTRUCTIONS</Text>
          <Text style={styles.p}>
            Upon my death, I direct that my digital assets be distributed to the above-named beneficiaries according to the specified percentages. The distribution should be made to their designated addresses.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>SECTION 5: SPECIAL INSTRUCTIONS</Text>
          <Text style={styles.p}>
            {state.owner.specialInstructions || 'None specified.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>SECTION 6: LEGAL DISCLAIMERS</Text>
          <Text style={styles.p}>
            This addendum is intended to supplement, not replace, my primary Last Will and Testament. I acknowledge that:
          </Text>
          <Text style={styles.p}>1. Digital asset laws vary by jurisdiction and continue to evolve</Text>
          <Text style={styles.p}>2. Technical challenges may affect asset recovery</Text>
          <Text style={styles.p}>3. Private keys or seed phrases may be required for asset access</Text>
          <Text style={styles.p}>4. Professional legal and technical assistance is recommended</Text>
          <Text style={styles.p}>5. The LastWish.eth platform provides tools but not legal advice</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.p}>Date: {currentDate}</Text>
          <Text style={styles.p}>Testator: {state.owner.fullName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.p}>
            ---
          </Text>
          <Text style={styles.p}>
            IMPORTANT NOTICE: This document is generated by LastWish.eth, a digital asset inheritance planning tool. This is not a substitute for professional legal advice. Please consult with an attorney familiar with digital asset inheritance laws in your jurisdiction.
          </Text>
          <Text style={styles.p}>
            Document ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export default function Generate() {
  const { state } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const canGenerate = () => {
    return (
      state.owner.fullName &&
      state.wallets.length > 0 &&
      state.beneficiaries.length > 0 &&
      state.assignments.length > 0
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation time
    setTimeout(() => {
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Generate Documents</h1>
      
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-800 mb-2">Requirements Check</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {state.owner.fullName ? '✅' : '❌'} Owner profile completed
            </div>
            <div className="flex items-center gap-2">
              {state.wallets.length > 0 ? '✅' : '❌'} At least one wallet connected ({state.wallets.length})
            </div>
            <div className="flex items-center gap-2">
              {state.beneficiaries.length > 0 ? '✅' : '❌'} At least one beneficiary added ({state.beneficiaries.length})
            </div>
            <div className="flex items-center gap-2">
              {state.assignments.length > 0 ? '✅' : '❌'} Asset assignments completed ({state.assignments.length})
            </div>
          </div>
        </div>

        {canGenerate() ? (
          <div className="space-y-4">
            <div className="text-center">
              <PDFDownloadLink 
                document={<WillDoc />} 
                fileName={`lastwish-will-${new Date().toISOString().split('T')[0]}.pdf`}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-block"
              >
                {({ blob, url, loading, error }) => 
                  loading ? 'Generating PDF...' : 'Download PDF Document'
                }
              </PDFDownloadLink>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Document Preview</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Testator:</strong> {state.owner.fullName}</p>
                <p><strong>Wallets:</strong> {state.wallets.length} connected</p>
                <p><strong>Assets:</strong> {state.tokens.length} tokens, {state.nfts.length} NFTs</p>
                <p><strong>Beneficiaries:</strong> {state.beneficiaries.length} designated</p>
                <p><strong>Assignments:</strong> {state.assignments.length} completed</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Please complete all required steps before generating documents.
            </p>
            <div className="space-x-3">
              {!state.owner.fullName && (
                <a href="/onboarding" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Complete Profile
                </a>
              )}
              {state.wallets.length === 0 && (
                <a href="/wallets" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Connect Wallets
                </a>
              )}
              {state.beneficiaries.length === 0 && (
                <a href="/beneficiaries" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Add Beneficiaries
                </a>
              )}
              {state.assignments.length === 0 && (
                <a href="/assignments" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Complete Assignments
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}