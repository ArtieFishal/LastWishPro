'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { generatePDF } from '../lib/pdf-generator';
import { pinToIPFS } from '../lib/ipfs-pin';
import { paymentService } from '../lib/payment-service';
import { ensService } from '../lib/ens-resolve';

export default function LastWishMobile() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState<'owner' | 'beneficiaries' | 'assets'>('owner');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Zustand store
  const {
    state,
    setOwner,
    addWallet,
    removeWallet,
    addBeneficiary,
    removeBeneficiary,
    setTokens,
    setNfts,
    setPayment,
    clearState
  } = useStore();

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  
  // Form states with initial values from store
  const [ownerName, setOwnerName] = useState(state.owner.fullName);
  const [specialInstructions, setSpecialInstructions] = useState(state.owner.specialInstructions || '');
  const [walletInput, setWalletInput] = useState('');
  
  // Beneficiary form states
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryWallet, setBeneficiaryWallet] = useState('');
  const [beneficiaryEmail, setBeneficiaryEmail] = useState('');
  const [beneficiaryRelationship, setBeneficiaryRelationship] = useState('');

  // Update primary wallet when connected
  useEffect(() => {
    if (isConnected && address) {
      setOwner({ primaryWallet: address });
    }
  }, [isConnected, address, setOwner]);

  // Auto-save owner info
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (ownerName !== state.owner.fullName || specialInstructions !== state.owner.specialInstructions) {
        setOwner({
          fullName: ownerName,
          specialInstructions: specialInstructions,
          primaryWallet: address
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [ownerName, specialInstructions, address, setOwner, state.owner]);

  // Add additional wallet
  const handleAddWallet = async () => {
    if (walletInput.trim()) {
      setIsLoading(true);
      setLoadingMessage('Adding wallet...');
      
      try {
        let resolvedAddress = walletInput;
        let ensName = undefined;
        
        // Check if it's an ENS name
        if (walletInput.includes('.eth')) {
          ensName = walletInput;
          // Resolve ENS to address
          const resolved = await ensService.resolveENS(walletInput);
          if (resolved) {
            resolvedAddress = resolved;
          }
        }
        
        addWallet({
          address: resolvedAddress,
          ens: ensName
        });
        
        setWalletInput('');
      } catch (error) {
        console.error('Error adding wallet:', error);
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    }
  };

  // Add beneficiary
  const handleAddBeneficiary = async () => {
    if (beneficiaryName.trim()) {
      setIsLoading(true);
      setLoadingMessage('Adding beneficiary...');
      
      try {
        let addressOrEns = beneficiaryWallet;
        
        // If it's an ENS name, we'll store it as-is and resolve it later
        addBeneficiary({
          name: beneficiaryName,
          addressOrEns: addressOrEns,
          email: beneficiaryEmail,
          relationship: beneficiaryRelationship
        });
        
        // Reset form
        setBeneficiaryName('');
        setBeneficiaryWallet('');
        setBeneficiaryEmail('');
        setBeneficiaryRelationship('');
      } catch (error) {
        console.error('Error adding beneficiary:', error);
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    }
  };

  // Load demo data
  const handleLoadDemoData = () => {
    setIsLoading(true);
    setLoadingMessage('Loading demo data...');
    
    // Add demo tokens
    setTokens([
      {
        chainId: 1,
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: 'USDC',
        decimals: 6,
        balance: '5000000000' // 5000 USDC
      },
      {
        chainId: 1,
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        symbol: 'DAI',
        decimals: 18,
        balance: '3000000000000000000000' // 3000 DAI
      }
    ]);
    
    // Add demo NFTs
    setNfts([
      {
        chainId: 1,
        contract: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
        tokenId: '1234',
        collection: 'Bored Ape Yacht Club',
        name: 'BAYC #1234'
      }
    ]);
    
    setTimeout(() => {
      setIsLoading(false);
      setLoadingMessage('');
    }, 1000);
  };

  // Load real assets
  const handleLoadAssets = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage('Loading your assets...');
    
    try {
      // Here you would integrate with actual blockchain data providers
      // For now, we'll simulate it
      setTimeout(() => {
        setTokens([]);
        setNfts([]);
        setIsLoading(false);
        setLoadingMessage('');
        alert('Assets loaded (in production, this would fetch real blockchain data)');
      }, 2000);
    } catch (error) {
      console.error('Error loading assets:', error);
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Handle payment
  const handlePayment = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage('Processing payment...');
    
    try {
      // Check for ENS discount
      const hasENS = state.wallets.some(w => w.ens) || address?.includes('.eth');
      const amount = hasENS ? '0.00008' : '0.0001'; // 20% discount for ENS holders
      
      // In production, this would trigger actual payment
      const txHash = await paymentService.processPayment(address!, amount);
      
      setPayment({ txHash });
      
      setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage('');
        alert('Payment successful! Transaction: ' + txHash);
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      setIsLoading(false);
      setLoadingMessage('');
      alert('Payment failed. Please try again.');
    }
  };

  // Generate and print
  const handleGeneratePrint = async () => {
    if (!state.payment?.txHash) {
      alert('Please complete payment first');
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage('Generating document...');
    
    try {
      // Generate PDF
      const pdfBlob = await generatePDF(state);
      
      setLoadingMessage('Uploading to IPFS...');
      
      // Pin to IPFS
      const ipfsHash = await pinToIPFS(pdfBlob);
      
      setLoadingMessage('Opening document...');
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LastWish_${state.owner.fullName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage('');
        alert(`Document generated successfully!\nIPFS Hash: ${ipfsHash}`);
      }, 1000);
    } catch (error) {
      console.error('Error generating document:', error);
      setIsLoading(false);
      setLoadingMessage('');
      alert('Failed to generate document. Please try again.');
    }
  };

  // Reset app
  const handleResetApp = () => {
    if (confirm('Are you sure you want to reset the app? This will clear all local data.')) {
      clearState();
      setOwnerName('');
      setSpecialInstructions('');
      setWalletInput('');
      setBeneficiaryName('');
      setBeneficiaryWallet('');
      setBeneficiaryEmail('');
      setBeneficiaryRelationship('');
      setCurrentSection('owner');
    }
  };

  // Navigation helpers
  const navigateSection = (direction: 'back' | 'forward') => {
    const sections: Array<'owner' | 'beneficiaries' | 'assets'> = ['owner', 'beneficiaries', 'assets'];
    const currentIndex = sections.indexOf(currentSection);
    
    if (direction === 'back' && currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1]);
    } else if (direction === 'forward' && currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-2 border-[#007aff] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white text-lg">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Mobile Status Bar */}
      <div className="fixed top-0 left-0 right-0 h-11 bg-[#3a3a3c] flex items-center justify-between px-5 z-50">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span>8:29</span>
          <span className="text-xs">◂</span>
          <span className="font-normal">Messages</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs">•••••</span>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Browser Header */}
      <div className="fixed top-11 left-0 right-0 h-12 bg-[#2a2a2c] flex items-center px-4 gap-3 z-40">
        <button className="w-8 h-8 flex items-center justify-center">⚡</button>
        <div className="flex-1 bg-[#1c1c1e] rounded-[10px] py-2 text-center text-sm">
          vxndzzgq.manus.space
        </div>
        <button className="w-8 h-8 flex items-center justify-center">↗</button>
      </div>

      {/* Main Content */}
      <div className="pt-[92px] pb-24 min-h-screen">
        <div className="max-w-[500px] mx-auto px-5">
          {/* App Header */}
          <div className="mb-6">
            <h1 className="text-[32px] font-bold tracking-tight mb-1">LastWish.eth</h1>
            <p className="text-[#8e8e93] text-[17px] mb-5">"the decentralized solution"</p>
            <div className="flex gap-3 items-center flex-wrap">
              <button 
                onClick={handleResetApp}
                className="bg-[#2c2c2e] text-white border-none rounded-[20px] px-4 py-2 text-[17px] font-semibold"
              >
                Reset App
              </button>
              <div className="bg-[#34c759] text-black rounded-[20px] px-4 py-2 text-[17px] font-semibold">
                Ethereum Mainnet
              </div>
            </div>
          </div>

          {/* Owner Section */}
          {currentSection === 'owner' && (
            <>
              <div className="bg-[#1c1c1e] rounded-[20px] p-6 mb-5">
                <h2 className="text-[28px] font-bold mb-3">Owner Information</h2>
                <p className="text-[#8e8e93] text-[17px] mb-6 leading-relaxed">
                  Enter your full legal name and any special instructions for your will.
                </p>

                <div className="mb-5">
                  <label className="block text-[17px] font-semibold mb-2">
                    Full Legal Name <span className="text-[#ff3b30]">*</span>
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-[#2c2c2e] border-none rounded-[12px] p-4 text-[17px] text-white"
                    placeholder="John Smith"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-[17px] font-semibold mb-2">
                    Primary Wallet Address
                  </label>
                  {isConnected ? (
                    <div className="bg-[#2c2c2e] rounded-[12px] p-4 text-[17px] text-[#8e8e93] text-center">
                      {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                    </div>
                  ) : (
                    <div className="bg-[#2c2c2e] rounded-[12px] p-4 flex justify-center">
                      <ConnectButton />
                    </div>
                  )}
                </div>

                <div className="mb-5">
                  <label className="block text-[17px] font-semibold mb-2">
                    Special Instructions (optional)
                  </label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full bg-[#2c2c2e] border-none rounded-[12px] p-4 text-[17px] text-white resize-none min-h-[120px] leading-relaxed"
                    placeholder="Enter any special instructions for your executor regarding the management and distribution of your digital assets..."
                  />
                </div>
              </div>

              <div className="bg-[#1c1c1e] rounded-[20px] p-6 mb-5">
                <h2 className="text-[28px] font-bold mb-3">Additional Wallets</h2>
                <p className="text-[#8e8e93] text-[17px] mb-6 leading-relaxed">
                  Add up to 20 wallet addresses that contain your digital assets.
                </p>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={walletInput}
                    onChange={(e) => setWalletInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddWallet()}
                    className="flex-1 bg-[#2c2c2e] border-none rounded-[12px] p-4 text-[17px] text-white"
                    placeholder="0x... or alice.eth"
                  />
                  <button
                    onClick={handleAddWallet}
                    className="bg-[#007aff] text-white border-none rounded-[12px] px-5 py-3 text-[17px] font-semibold"
                  >
                    Add Wallet
                  </button>
                </div>

                {state.wallets.length > 0 && (
                  <div className="mt-5">
                    <div className="flex py-2 border-b border-[#38383a] text-[#8e8e93] text-[13px] font-semibold uppercase tracking-wider">
                      <div className="flex-1">Wallet Address</div>
                      <div className="flex-1">ENS</div>
                      <div className="flex-1">Actions</div>
                    </div>
                    {state.wallets.map((wallet) => (
                      <div key={wallet.id} className="flex py-4 border-b border-[#38383a] items-center">
                        <div className="flex-1 text-[17px]">
                          {wallet.address.substring(0, 6)}...{wallet.address.substring(wallet.address.length - 4)}
                        </div>
                        <div className="flex-1 text-[17px]">{wallet.ens || '-'}</div>
                        <div className="flex-1">
                          <button
                            onClick={() => removeWallet(wallet.id)}
                            className="text-[#ff3b30] text-[17px]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#1c1c1e] rounded-[20px] p-6 mb-5">
                <h2 className="text-[28px] font-bold mb-3">Beneficiaries</h2>
                <div className="flex items-center justify-center gap-1 text-[#8e8e93] text-[15px] mt-2">
                  <span>⚙</span>
                  <span>Made with Manus</span>
                </div>
              </div>
            </>
          )}

          {/* Beneficiaries Section */}
          {currentSection === 'beneficiaries' && (
            <>
              <div className="bg-[#1c1c1e] rounded-[20px] p-6 mb-5">
                <h2 className="text-[28px] font-bold mb-3">Beneficiaries</h2>
                <p className="text-[#8e8e93] text-[17px] mb-6 leading-relaxed">
                  Wallet is optional — you can enter an ENS like alice.eth and we'll resolve it.
                </p>

                <div className="mb-5">
                  <label className="block text-[17px] font-semibold mb-2">
                    Name <span className="text-[#ff3b30]">*</span>
                  </label>
                  <input
                    type="text"
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    className="w-full bg-[#2c2c2e] border-none rounded-[12px] p-4 text-[17px] text-white"
                    placeholder="Jane Doe"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-[17px] font-semibold mb-2">
                    Wallet or ENS (optional)
                  </label>
                  <input
                    type="text"
                    value={beneficiaryWallet}
                    onChange={(e) => setBeneficiaryWallet(e.target.value)}
                    className="w-full bg-[#2c2c2e] border-none rounded-[12px] p-4 text-[17px] text-white"
                    placeholder="0x... or alice.eth"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-[17px] font-semibold mb-2">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={beneficiaryEmail}
                    onChange={(e) => setBeneficiaryEmail(e.target.value)}
                    className="w-full bg-[#2c2c2e] border-none rounded-[12px] p-4 text-[17px] text-white"
                    placeholder="jane@example.com"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-[17px] font-semibold mb-2">
                    Relationship (optional)
                  </label>
                  <input
                    type="text"
                    value={beneficiaryRelationship}
                    onChange={(e) => setBeneficiaryRelationship(e.target.value)}
                    className="w-full bg-[#2c2c2e] border-none rounded-[12px] p-4 text-[17px] text-white"
                    placeholder="Spouse, Child, Friend, etc."
                  />
                </div>

                <button
                  onClick={handleAddBeneficiary}
                  className="w-full bg-[#007aff] text-white border-none rounded-[12px] p-4 text-[17px] font-semibold"
                >
                  Add Beneficiary
                </button>

                {state.beneficiaries.length > 0 && (
                  <div className="mt-6">
                    <div className="flex py-2 border-b border-[#38383a] text-[#8e8e93] text-[13px] font-semibold uppercase tracking-wider">
                      <div className="flex-1">Name</div>
                      <div className="flex-1">Address</div>
                      <div className="flex-1">ENS</div>
                      <div className="flex-1">Email</div>
                      <div className="flex-1">Relationship</div>
                    </div>
                    {state.beneficiaries.map((beneficiary) => (
                      <div key={beneficiary.id} className="flex py-4 border-b border-[#38383a] items-center text-[15px]">
                        <div className="flex-1">{beneficiary.name}</div>
                        <div className="flex-1">
                          {beneficiary.addressOrEns?.startsWith('0x') 
                            ? `${beneficiary.addressOrEns.substring(0, 6)}...` 
                            : '-'}
                        </div>
                        <div className="flex-1">
                          {beneficiary.addressOrEns?.includes('.eth') 
                            ? beneficiary.addressOrEns 
                            : '-'}
                        </div>
                        <div className="flex-1">{beneficiary.email || '-'}</div>
                        <div className="flex-1">{beneficiary.relationship || '-'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#1c1c1e] rounded-[20px] p-6 mb-5">
                <h2 className="text-[28px] font-bold mb-3">Wallet</h2>
                <p className="text-[#8e8e93] text-[17px] mb-6 leading-relaxed">
                  Connect, sign a session (off-chain), or disconnect. Reset App clears local data.
                </p>

                <div className="flex gap-3">
                  <ConnectButton />
                </div>

                <div className="flex items-center justify-center gap-1 text-[#8e8e93] text-[15px] mt-5">
                  <span>⚙</span>
                  <span>Made with Manus</span>
                </div>
              </div>
            </>
          )}

          {/* Assets Section */}
          {currentSection === 'assets' && (
            <>
              <div className="bg-[#1c1c1e] rounded-[20px] p-6 mb-5">
                <h2 className="text-[28px] font-bold mb-3">Assets & Assignments</h2>
                <div className="flex gap-3">
                  <button 
                    onClick={handleLoadAssets}
                    className="flex-1 bg-[#636366] text-white border-none rounded-[12px] p-4 text-[17px] font-semibold"
                  >
                    Load Assets
                  </button>
                  <button 
                    onClick={handleLoadDemoData}
                    className="flex-1 bg-[#007aff] text-white border-none rounded-[12px] p-4 text-[17px] font-semibold"
                  >
                    Load Demo Data
                  </button>
                </div>
                
                {(state.tokens.length > 0 || state.nfts.length > 0) && (
                  <div className="mt-5 p-4 bg-[#2c2c2e] rounded-[12px]">
                    <p className="text-[#8e8e93] text-sm mb-2">Assets loaded:</p>
                    <p className="text-white">{state.tokens.length} tokens, {state.nfts.length} NFTs</p>
                  </div>
                )}
              </div>

              <div className="bg-[#1c1c1e] rounded-[20px] p-6 mb-5">
                <h2 className="text-[28px] font-bold mb-3">Payment</h2>
                <p className="text-[#8e8e93] text-[17px] mb-6 leading-relaxed">
                  ENS holders get a discount.
                </p>
                <button 
                  onClick={handlePayment}
                  className="w-full bg-[#34c759] text-black border-none rounded-[12px] p-4 text-[17px] font-bold"
                  disabled={!isConnected}
                >
                  Pay {state.wallets.some(w => w.ens) ? '0.00008' : '0.0001'} ETH
                </button>
                <p className="text-center text-[#8e8e93] text-[17px] mt-4">
                  {state.payment?.txHash 
                    ? '✓ Payment complete' 
                    : isConnected 
                      ? 'Ready to pay' 
                      : 'Awaiting connection...'}
                </p>
              </div>

              <div className="bg-[#1c1c1e] rounded-[20px] p-6 mb-5">
                <h2 className="text-[28px] font-bold mb-3">Generate & Print</h2>
                <button 
                  onClick={handleGeneratePrint}
                  className="w-full bg-[#af52de] text-white border-none rounded-[12px] p-4 text-[17px] font-bold"
                  disabled={!state.payment?.txHash}
                >
                  Generate & Print
                </button>
              </div>

              <div className="text-center text-[#8e8e93] py-8">
                <p className="text-[15px]">© 2025 LastWish</p>
                <div className="flex items-center justify-center gap-1 text-[15px] mt-2">
                  <span>⚙</span>
                  <span>Made with Manus</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#2a2a2c] flex justify-around items-center pb-5 z-40">
        <button 
          onClick={() => navigateSection('back')}
          className="bg-transparent border-none text-white text-2xl p-2"
        >
          ←
        </button>
        <button 
          onClick={() => navigateSection('forward')}
          className="bg-transparent border-none text-white text-2xl p-2"
        >
          →
        </button>
        <button className="bg-[#636366] rounded-full w-11 h-11 flex items-center justify-center text-white text-2xl">
          +
        </button>
        <button className="bg-[#1c1c1e] border-2 border-[#636366] rounded-lg px-3 py-1 text-[17px] font-bold text-white">
          10
        </button>
        <button className="bg-transparent border-none text-white text-2xl p-2">
          •••
        </button>
      </div>
    </div>
  );
}