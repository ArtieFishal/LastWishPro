import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const LastWishIntegrated: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<'owner' | 'beneficiaries' | 'assets'>('owner');
  
  // Zustand store
  const {
    state,
    setOwner,
    addWallet,
    removeWallet,
    addBeneficiary,
    removeBeneficiary,
    updateBeneficiary,
    clearState
  } = useStore();

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Form states
  const [ownerName, setOwnerName] = useState(state.owner.fullName || '');
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

  // Save owner info
  const handleSaveOwner = () => {
    setOwner({
      fullName: ownerName,
      specialInstructions: specialInstructions,
      primaryWallet: address
    });
  };

  // Add additional wallet
  const handleAddWallet = () => {
    if (walletInput.trim()) {
      addWallet({
        address: walletInput,
        ens: walletInput.includes('.eth') ? walletInput : undefined
      });
      setWalletInput('');
    }
  };

  // Add beneficiary
  const handleAddBeneficiary = () => {
    if (beneficiaryName.trim()) {
      addBeneficiary({
        name: beneficiaryName,
        addressOrEns: beneficiaryWallet,
        email: beneficiaryEmail,
        relationship: beneficiaryRelationship
      });
      // Reset form
      setBeneficiaryName('');
      setBeneficiaryWallet('');
      setBeneficiaryEmail('');
      setBeneficiaryRelationship('');
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-[44px] bg-[#3a3a3c] flex items-center justify-between px-5 z-50">
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
      <div className="fixed top-[44px] left-0 right-0 h-[50px] bg-[#2a2a2c] flex items-center px-4 gap-3 z-40">
        <button className="w-8 h-8 flex items-center justify-center">⚡</button>
        <div className="flex-1 bg-[#1c1c1e] rounded-[10px] py-2 text-center text-sm">
          vxndzzgq.manus.space
        </div>
        <button className="w-8 h-8 flex items-center justify-center">↗</button>
      </div>

      {/* Main Content */}
      <div className="pt-[94px] pb-[100px] min-h-screen">
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

          {/* Section: Owner Information */}
          {currentSection === 'owner' && (
            <>
              {/* Owner Information Card */}
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
                    onBlur={handleSaveOwner}
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
                    <div className="bg-[#2c2c2e] rounded-[12px] p-4">
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
                    onBlur={handleSaveOwner}
                    className="w-full bg-[#2c2c2e] border-none rounded-[12px] p-4 text-[17px] text-white resize-none min-h-[120px] leading-relaxed"
                    placeholder="Enter any special instructions for your executor regarding the management and distribution of your digital assets..."
                  />
                </div>
              </div>

              {/* Additional Wallets Card */}
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

              {/* Beneficiaries Preview */}
              <div className="bg-[#1c1c1e] rounded-[20px] p-6 mb-5">
                <h2 className="text-[28px] font-bold mb-3">Beneficiaries</h2>
                <div className="flex items-center justify-center gap-1 text-[#8e8e93] text-[15px] mt-2">
                  <span>⚙</span>
                  <span>Made with Manus</span>
                </div>
              </div>
            </>
          )}

          {/* Section: Beneficiaries */}
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
                  {!isConnected ? (
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => (
                        <button
                          onClick={openConnectModal}
                          className="flex-1 bg-[#007aff] text-white border-none rounded-[12px] p-4 text-[17px] font-semibold"
                        >
                          Connect
                        </button>
                      )}
                    </ConnectButton.Custom>
                  ) : (
                    <>
                      <button className="flex-1 bg-[#007aff] text-white border-none rounded-[12px] p-4 text-[17px] font-semibold">
                        Connected
                      </button>
                      <button className="flex-1 bg-[#636366] text-white border-none rounded-[12px] p-4 text-[17px] font-semibold">
                        Sign Session
                      </button>
                      <button
                        onClick={() => disconnect()}
                        className="flex-1 bg-[#ff3b30] text-white border-none rounded-[12px] p-4 text-[17px] font-semibold"
                      >
                        Disconnect
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1 text-[#8e8e93] text-[15px] mt-5">
                  <span>⚙</span>
                  <span>Made with Manus</span>
                </div>
              </div>
            </>
          )}

          {/* Section: Assets & Payment */}
          {currentSection === 'assets' && (
            <>
              <div className="bg-[#1c1c1e] rounded-[20px] p-6 mb-5">
                <h2 className="text-[28px] font-bold mb-3">Assets & Assignments</h2>
                <div className="flex gap-3">
                  <button className="flex-1 bg-[#636366] text-white border-none rounded-[12px] p-4 text-[17px] font-semibold">
                    Load Assets
                  </button>
                  <button className="flex-1 bg-[#007aff] text-white border-none rounded-[12px] p-4 text-[17px] font-semibold">
                    Load Demo Data
                  </button>
                </div>
              </div>

              <div className="bg-[#1c1c1e] rounded-[20px] p-6 mb-5">
                <h2 className="text-[28px] font-bold mb-3">Payment</h2>
                <p className="text-[#8e8e93] text-[17px] mb-6 leading-relaxed">
                  ENS holders get a discount.
                </p>
                <button className="w-full bg-[#34c759] text-black border-none rounded-[12px] p-4 text-[17px] font-bold">
                  Pay 0.0001 ETH
                </button>
                <p className="text-center text-[#8e8e93] text-[17px] mt-4">
                  {isConnected ? 'Ready to pay' : 'Awaiting connection...'}
                </p>
              </div>

              <div className="bg-[#1c1c1e] rounded-[20px] p-6 mb-5">
                <h2 className="text-[28px] font-bold mb-3">Generate & Print</h2>
                <button className="w-full bg-[#af52de] text-white border-none rounded-[12px] p-4 text-[17px] font-bold">
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
      <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-[#2a2a2c] flex justify-around items-center pb-5 z-40">
        <button 
          onClick={() => {
            const sections: Array<'owner' | 'beneficiaries' | 'assets'> = ['owner', 'beneficiaries', 'assets'];
            const currentIndex = sections.indexOf(currentSection);
            if (currentIndex > 0) {
              setCurrentSection(sections[currentIndex - 1]);
            }
          }}
          className="bg-transparent border-none text-white text-2xl p-2"
        >
          ←
        </button>
        <button 
          onClick={() => {
            const sections: Array<'owner' | 'beneficiaries' | 'assets'> = ['owner', 'beneficiaries', 'assets'];
            const currentIndex = sections.indexOf(currentSection);
            if (currentIndex < sections.length - 1) {
              setCurrentSection(sections[currentIndex + 1]);
            }
          }}
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
};

export default LastWishIntegrated;