import React, { useState, useEffect } from 'react';
import './lastwish-styles.css';

// Simple local storage based state management
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

const SimpleLastWish = () => {
  const [currentSection, setCurrentSection] = useState('owner');
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  
  // Persistent state using localStorage
  const [state, setState] = useLocalStorage('lastwish-state', {
    owner: { fullName: '', specialInstructions: '', primaryWallet: '' },
    wallets: [],
    beneficiaries: [],
    tokens: [],
    nfts: [],
    payment: null
  });

  // Form states
  const [ownerName, setOwnerName] = useState(state.owner.fullName);
  const [specialInstructions, setSpecialInstructions] = useState(state.owner.specialInstructions || '');
  const [walletInput, setWalletInput] = useState('');
  
  // Beneficiary form states
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryWallet, setBeneficiaryWallet] = useState('');
  const [beneficiaryEmail, setBeneficiaryEmail] = useState('');
  const [beneficiaryRelationship, setBeneficiaryRelationship] = useState('');

  // Auto-save owner info
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setState(prev => ({
        ...prev,
        owner: {
          ...prev.owner,
          fullName: ownerName,
          specialInstructions: specialInstructions,
          primaryWallet: walletAddress
        }
      }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [ownerName, specialInstructions, walletAddress]);

  // Connect wallet (simplified)
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet. Please make sure MetaMask is installed.');
      }
    } else {
      alert('Please install MetaMask to connect your wallet.');
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
  };

  // Add wallet
  const handleAddWallet = () => {
    if (walletInput.trim()) {
      const newWallet = {
        id: Date.now().toString(),
        address: walletInput,
        ens: walletInput.includes('.eth') ? walletInput : undefined
      };
      
      setState(prev => ({
        ...prev,
        wallets: [...prev.wallets, newWallet]
      }));
      
      setWalletInput('');
    }
  };

  // Remove wallet
  const removeWallet = (id) => {
    setState(prev => ({
      ...prev,
      wallets: prev.wallets.filter(w => w.id !== id)
    }));
  };

  // Add beneficiary
  const handleAddBeneficiary = () => {
    if (beneficiaryName.trim()) {
      const newBeneficiary = {
        id: Date.now().toString(),
        name: beneficiaryName,
        addressOrEns: beneficiaryWallet,
        email: beneficiaryEmail,
        relationship: beneficiaryRelationship
      };
      
      setState(prev => ({
        ...prev,
        beneficiaries: [...prev.beneficiaries, newBeneficiary]
      }));
      
      // Reset form
      setBeneficiaryName('');
      setBeneficiaryWallet('');
      setBeneficiaryEmail('');
      setBeneficiaryRelationship('');
    }
  };

  // Remove beneficiary
  const removeBeneficiary = (id) => {
    setState(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter(b => b.id !== id)
    }));
  };

  // Load demo data
  const loadDemoData = () => {
    setState(prev => ({
      ...prev,
      tokens: [
        {
          chainId: 1,
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'USDC',
          decimals: 6,
          balance: '5000000000'
        },
        {
          chainId: 1,
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          symbol: 'DAI',
          decimals: 18,
          balance: '3000000000000000000000'
        }
      ],
      nfts: [
        {
          chainId: 1,
          contract: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
          tokenId: '1234',
          collection: 'Bored Ape Yacht Club',
          name: 'BAYC #1234'
        }
      ]
    }));
    
    alert('Demo data loaded!');
  };

  // Handle payment (simplified)
  const handlePayment = () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    // Simulate payment
    setTimeout(() => {
      const mockTxHash = `0x${Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;
      
      setState(prev => ({
        ...prev,
        payment: { txHash: mockTxHash }
      }));
      
      alert('Payment successful! Transaction: ' + mockTxHash.substring(0, 10) + '...');
    }, 1000);
  };

  // Generate PDF (simplified)
  const generatePDF = () => {
    if (!state.payment?.txHash) {
      alert('Please complete payment first');
      return;
    }
    
    // Create a simple text representation
    const content = `
LAST WISH - CRYPTOCURRENCY ESTATE PLANNING
Generated on: ${new Date().toLocaleDateString()}

OWNER INFORMATION
Name: ${state.owner.fullName}
Primary Wallet: ${state.owner.primaryWallet || 'Not connected'}
Special Instructions: ${state.owner.specialInstructions || 'None'}

ADDITIONAL WALLETS
${state.wallets.map(w => w.ens || w.address).join('\n')}

BENEFICIARIES
${state.beneficiaries.map(b => `
Name: ${b.name}
Wallet/ENS: ${b.addressOrEns || 'Not provided'}
Email: ${b.email || 'Not provided'}
Relationship: ${b.relationship || 'Not provided'}
`).join('\n')}

DIGITAL ASSETS
Tokens: ${state.tokens.length}
NFTs: ${state.nfts.length}

Payment Transaction: ${state.payment.txHash}

This document was generated by LastWish.eth
Store this document securely with your will.
    `;
    
    // Create download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LastWish_${state.owner.fullName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Document generated and downloaded!');
  };

  // Reset app
  const resetApp = () => {
    if (confirm('Are you sure you want to reset the app? This will clear all local data.')) {
      localStorage.removeItem('lastwish-state');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="status-bar">
          <span>8:29</span>
          <span style={{ fontSize: '12px' }}>◂</span>
          <span style={{ fontWeight: 'normal' }}>Messages</span>
        </div>
        <div className="nav-icons">
          <span>•••••</span>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Browser Header */}
      <div className="url-bar">
        <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px' }}>⚡</button>
        <div className="url-input">vxndzzgq.manus.space</div>
        <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px' }}>↗</button>
      </div>

      {/* Main Content */}
      <div className="container" style={{ paddingTop: '110px' }}>
        {/* App Header */}
        <div className="app-header">
          <div className="app-title">
            <h1>LastWish.eth</h1>
            <p>"the decentralized solution"</p>
          </div>
          <div className="header-buttons">
            <button onClick={resetApp} className="reset-btn">Reset App</button>
            <div className="network-badge">Ethereum Mainnet</div>
          </div>
        </div>

        {/* Owner Section */}
        {currentSection === 'owner' && (
          <>
            <div className="card">
              <h2 className="card-title">Owner Information</h2>
              <p className="card-description">
                Enter your full legal name and any special instructions for your will.
              </p>

              <div className="form-group">
                <label className="form-label">
                  Full Legal Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="form-input"
                  placeholder="John Smith"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Wallet Address</label>
                {isConnected ? (
                  <div className="wallet-display">
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                  </div>
                ) : (
                  <button onClick={connectWallet} className="btn btn-full">
                    Connect Wallet
                  </button>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Special Instructions (optional)</label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="form-textarea"
                  placeholder="Enter any special instructions for your executor regarding the management and distribution of your digital assets..."
                />
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">Additional Wallets</h2>
              <p className="card-description">
                Add up to 20 wallet addresses that contain your digital assets.
              </p>

              <div className="input-group">
                <input
                  type="text"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddWallet()}
                  className="form-input"
                  placeholder="0x... or alice.eth"
                />
                <button onClick={handleAddWallet} className="btn">Add Wallet</button>
              </div>

              {state.wallets.length > 0 && (
                <div className="table-container">
                  <div className="table-header">
                    <div>Wallet Address</div>
                    <div>ENS</div>
                    <div>Actions</div>
                  </div>
                  {state.wallets.map((wallet) => (
                    <div key={wallet.id} className="table-row">
                      <div>{wallet.address.substring(0, 6)}...{wallet.address.substring(wallet.address.length - 4)}</div>
                      <div>{wallet.ens || '-'}</div>
                      <div>
                        <button onClick={() => removeWallet(wallet.id)} style={{ color: '#ff3b30', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="card-title">Beneficiaries</h2>
              <div className="made-with">
                <span>⚙</span>
                <span>Made with Manus</span>
              </div>
            </div>
          </>
        )}

        {/* Beneficiaries Section */}
        {currentSection === 'beneficiaries' && (
          <>
            <div className="card">
              <h2 className="card-title">Beneficiaries</h2>
              <p className="card-description">
                Wallet is optional — you can enter an ENS like alice.eth and we'll resolve it.
              </p>

              <div className="form-group">
                <label className="form-label">
                  Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  className="form-input"
                  placeholder="Jane Doe"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Wallet or ENS (optional)</label>
                <input
                  type="text"
                  value={beneficiaryWallet}
                  onChange={(e) => setBeneficiaryWallet(e.target.value)}
                  className="form-input"
                  placeholder="0x... or alice.eth"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email (optional)</label>
                <input
                  type="email"
                  value={beneficiaryEmail}
                  onChange={(e) => setBeneficiaryEmail(e.target.value)}
                  className="form-input"
                  placeholder="jane@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Relationship (optional)</label>
                <input
                  type="text"
                  value={beneficiaryRelationship}
                  onChange={(e) => setBeneficiaryRelationship(e.target.value)}
                  className="form-input"
                  placeholder="Spouse, Child, Friend, etc."
                />
              </div>

              <button onClick={handleAddBeneficiary} className="btn btn-full">
                Add Beneficiary
              </button>

              {state.beneficiaries.length > 0 && (
                <div className="table-container" style={{ marginTop: '20px' }}>
                  <div className="table-header">
                    <div>Name</div>
                    <div>Wallet/ENS</div>
                    <div>Email</div>
                    <div>Actions</div>
                  </div>
                  {state.beneficiaries.map((beneficiary) => (
                    <div key={beneficiary.id} className="table-row">
                      <div>{beneficiary.name}</div>
                      <div>{beneficiary.addressOrEns || '-'}</div>
                      <div>{beneficiary.email || '-'}</div>
                      <div>
                        <button onClick={() => removeBeneficiary(beneficiary.id)} style={{ color: '#ff3b30', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="card-title">Wallet</h2>
              <p className="card-description">
                Connect, sign a session (off-chain), or disconnect. Reset App clears local data.
              </p>

              <div className="btn-group">
                {!isConnected ? (
                  <button onClick={connectWallet} className="btn">Connect</button>
                ) : (
                  <>
                    <button className="btn btn-success">Connected</button>
                    <button className="btn btn-secondary">Sign Session</button>
                    <button onClick={disconnectWallet} className="btn btn-danger">Disconnect</button>
                  </>
                )}
              </div>

              <div className="made-with">
                <span>⚙</span>
                <span>Made with Manus</span>
              </div>
            </div>
          </>
        )}

        {/* Assets Section */}
        {currentSection === 'assets' && (
          <>
            <div className="card">
              <h2 className="card-title">Assets & Assignments</h2>
              <div className="btn-group">
                <button className="btn btn-secondary">Load Assets</button>
                <button onClick={loadDemoData} className="btn">Load Demo Data</button>
              </div>
              
              {(state.tokens.length > 0 || state.nfts.length > 0) && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#2c2c2e', borderRadius: '12px' }}>
                  <p style={{ color: '#8e8e93', fontSize: '14px', marginBottom: '8px' }}>Assets loaded:</p>
                  <p>{state.tokens.length} tokens, {state.nfts.length} NFTs</p>
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="card-title">Payment</h2>
              <p className="card-description">ENS holders get a discount.</p>
              <button onClick={handlePayment} className="btn btn-success btn-full" disabled={!isConnected}>
                Pay {state.wallets.some(w => w.ens) ? '0.00008' : '0.0001'} ETH
              </button>
              <p className="status-message">
                {state.payment?.txHash 
                  ? '✓ Payment complete' 
                  : isConnected 
                    ? 'Ready to pay' 
                    : 'Awaiting connection...'}
              </p>
            </div>

            <div className="card">
              <h2 className="card-title">Generate & Print</h2>
              <button onClick={generatePDF} className="btn btn-purple btn-full" disabled={!state.payment?.txHash}>
                Generate & Print
              </button>
            </div>

            <div className="footer">
              <p>© 2025 LastWish</p>
              <div className="made-with">
                <span>⚙</span>
                <span>Made with Manus</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="mobile-nav">
        <button onClick={() => {
          const sections = ['owner', 'beneficiaries', 'assets'];
          const currentIndex = sections.indexOf(currentSection);
          if (currentIndex > 0) {
            setCurrentSection(sections[currentIndex - 1]);
          }
        }}>←</button>
        
        <button onClick={() => {
          const sections = ['owner', 'beneficiaries', 'assets'];
          const currentIndex = sections.indexOf(currentSection);
          if (currentIndex < sections.length - 1) {
            setCurrentSection(sections[currentIndex + 1]);
          }
        }}>→</button>
        
        <button className="add">+</button>
        <button className="tab-count">10</button>
        <button>•••</button>
      </div>
    </div>
  );
};

export default SimpleLastWish;