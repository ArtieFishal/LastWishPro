// LastWish.eth - Simple Working Version
(function(){
  const cfg = window.LASTWISH_CONFIG || {};
  const $ = (s)=>document.querySelector(s);
  
  // Elements
  const btnConnect=$("#btnConnect"),btnDisconnect=$("#btnDisconnect"),connStatus=$("#connStatus");
  const btnLoadDemo=$("#btnLoadDemo"),assetsWrap=$("#assetsWrap"),tblTokens=$("#tblTokens tbody"),tblNFTs=$("#tblNFTs tbody");
  const btnPay=$("#btnPay"),payStatus=$("#payStatus"),btnPrint=$("#btnPrint"),printStatus=$("#printStatus");
  const chainSelect = $("#chainSelect"), envBadge = $("#envBadge");
  
  // State
  let currentAccount=null,currentChainId=null;
  
  // Helpers
  function short(a){return a?a.slice(0,6)+"…"+a.slice(-4):"";}
  
  // Update network indicator
  function updateNetworkIndicator() {
    const selectedChain = chainSelect ? chainSelect.value : 'ethereum';
    const chainNames = {
      'ethereum': 'Ethereum Mainnet',
      'solana': 'Solana Mainnet', 
      'bitcoin': 'Bitcoin Mainnet'
    };
    if (envBadge) envBadge.textContent = chainNames[selectedChain] || 'Ethereum Mainnet';
  }
  
  // Chain selection handler
  if (chainSelect) {
    chainSelect.addEventListener('change', () => {
      updateNetworkIndicator();
      if (currentAccount) {
        disconnect();
        connStatus.textContent = "Please connect wallet for selected chain";
      }
    });
    updateNetworkIndicator();
  }
  
  // Connect function
  async function connect(){
    const selectedChain = chainSelect ? chainSelect.value : 'ethereum';
    
    if (selectedChain === 'bitcoin') {
      await connectBitcoin();
    } else if (selectedChain === 'solana') {
      await connectSolana();
    } else {
      await connectEthereum();
    }
  }
  
  async function connectEthereum() {
    if(!window.ethereum){ 
      alert("Install MetaMask, Coinbase Wallet, or another Ethereum wallet."); 
      return; 
    }
    connStatus.textContent="Connecting to Ethereum...";
    try{
      await window.ethereum.request({method:"eth_requestAccounts"});
      const accounts=await window.ethereum.request({method:"eth_accounts"});
      currentAccount=accounts[0];
      connStatus.textContent=`Connected to Ethereum as ${short(currentAccount)}`;
      btnDisconnect.disabled=false;
      btnPay.disabled=false;
    }catch(e){ 
      console.error(e); 
      connStatus.textContent="Ethereum connection failed"; 
    }
  }
  
  async function connectSolana() {
    if(!window.solana || !window.solana.isPhantom){ 
      alert("Install Phantom wallet or another Solana wallet."); 
      return; 
    }
    connStatus.textContent="Connecting to Solana...";
    try{
      const response = await window.solana.connect();
      currentAccount = response.publicKey.toString();
      connStatus.textContent=`Connected to Solana as ${short(currentAccount)}`;
      btnDisconnect.disabled=false;
      btnPay.disabled=false;
    }catch(e){ 
      console.error(e); 
      connStatus.textContent="Solana connection failed"; 
    }
  }
  
  async function connectBitcoin() {
    // Check for Bitcoin wallets with correct APIs
    const hasXverse = window.BitcoinProvider || window.XverseProviders?.BitcoinProvider;
    const hasUnisat = window.unisat;
    const hasOKX = window.okxwallet?.bitcoin;
    
    if (!hasXverse && !hasUnisat && !hasOKX) {
      alert("No Bitcoin wallet detected. Please install Xverse, Unisat, or OKX wallet and try again.");
      return;
    }
    
    connStatus.textContent="Connecting to Bitcoin...";
    
    try {
      let connected = false;
      
      // Try Xverse with correct API
      if (hasXverse && !connected) {
        try {
          let accounts;
          if (window.BitcoinProvider) {
            // New Xverse API
            accounts = await window.BitcoinProvider.request('getAccounts', null);
          } else if (window.XverseProviders?.BitcoinProvider) {
            // Legacy Xverse API
            accounts = await window.XverseProviders.BitcoinProvider.request('getAccounts', null);
          }
          
          if (accounts && accounts.length > 0) {
            currentAccount = accounts[0].address || accounts[0];
            connected = true;
            connStatus.textContent=`Connected to Bitcoin via Xverse as ${short(currentAccount)}`;
          }
        } catch (e) {
          console.log("Xverse connection failed:", e);
          // Try alternative Xverse connection method
          try {
            if (window.sats) {
              const response = await window.sats.connect();
              if (response && response.address) {
                currentAccount = response.address;
                connected = true;
                connStatus.textContent=`Connected to Bitcoin via Xverse as ${short(currentAccount)}`;
              }
            }
          } catch (e2) {
            console.log("Alternative Xverse connection failed:", e2);
          }
        }
      }
      
      // Try Unisat
      if (hasUnisat && !connected) {
        try {
          const accounts = await window.unisat.requestAccounts();
          if (accounts && accounts.length > 0) {
            currentAccount = accounts[0];
            connected = true;
            connStatus.textContent=`Connected to Bitcoin via Unisat as ${short(currentAccount)}`;
          }
        } catch (e) {
          console.log("Unisat connection failed:", e);
        }
      }
      
      // Try OKX
      if (hasOKX && !connected) {
        try {
          const accounts = await window.okxwallet.bitcoin.requestAccounts();
          if (accounts && accounts.length > 0) {
            currentAccount = accounts[0];
            connected = true;
            connStatus.textContent=`Connected to Bitcoin via OKX as ${short(currentAccount)}`;
          }
        } catch (e) {
          console.log("OKX connection failed:", e);
        }
      }
      
      if (connected) {
        btnDisconnect.disabled=false;
        btnPay.disabled=false;
      } else {
        throw new Error("Failed to connect to any Bitcoin wallet");
      }
      
    } catch(e) { 
      console.error(e); 
      connStatus.textContent="Bitcoin connection failed"; 
    }
  }
  
  function disconnect() {
    currentAccount = null;
    currentChainId = null;
    connStatus.textContent = "Not connected";
    btnDisconnect.disabled = true;
    btnPay.disabled = true;
    if (assetsWrap) assetsWrap.classList.add("hidden");
  }
  
  function loadDemo() {
    if (!assetsWrap || !tblTokens || !tblNFTs) return;
    
    const selectedChain = chainSelect ? chainSelect.value : 'ethereum';
    
    if (selectedChain === 'bitcoin') {
      // Bitcoin demo data
      tblTokens.innerHTML = `
        <tr><td>BTC</td><td>0.5</td><td>$22,500.00</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
        <tr><td>Ordinals</td><td>3</td><td>$1,500.00</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
        <tr><td>BRC-20 Tokens</td><td>1000</td><td>$800.00</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
      `;
      
      // Bitcoin NFTs/Ordinals
      tblNFTs.innerHTML = `
        <tr><td>Bitcoin Punk #1234</td><td>1</td><td>$5,000</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
        <tr><td>Ordinal #567890</td><td>1</td><td>$2,500</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
        <tr><td>BTC Rock #123</td><td>1</td><td>$8,000</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
      `;
    } else if (selectedChain === 'solana') {
      // Solana demo data
      tblTokens.innerHTML = `
        <tr><td>SOL</td><td>10.0</td><td>$900.00</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
        <tr><td>USDC</td><td>500.00</td><td>$500.00</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
        <tr><td>RAY</td><td>100</td><td>$200.00</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
      `;
      
      // Solana NFTs
      tblNFTs.innerHTML = `
        <tr><td>Solana Monkey #1234</td><td>1</td><td>$3,000</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
        <tr><td>DeGods #5678</td><td>1</td><td>$15,000</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
        <tr><td>Okay Bears #9012</td><td>1</td><td>$1,200</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
      `;
    } else {
      // Ethereum demo data (default)
      tblTokens.innerHTML = `
        <tr><td>USDC</td><td>1,000.00</td><td>$1,000.00</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
        <tr><td>WETH</td><td>0.5</td><td>$1,200.00</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
        <tr><td>UNI</td><td>100</td><td>$500.00</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
      `;
      
      // Ethereum NFTs
      tblNFTs.innerHTML = `
        <tr><td>Bored Ape #1234</td><td>1</td><td>$50,000</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
        <tr><td>CryptoPunk #5678</td><td>1</td><td>$80,000</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
        <tr><td>Azuki #9012</td><td>1</td><td>$15,000</td><td><button class="btn btn-secondary btn-sm">Add Split</button></td></tr>
      `;
    }
    
    assetsWrap.classList.remove("hidden");
  }
  
  async function pay() {
    if (!currentAccount) {
      alert("Please connect your wallet first.");
      return;
    }
    
    payStatus.textContent = "Processing payment...";
    
    // Simulate payment
    setTimeout(() => {
      payStatus.textContent = "Payment confirmed ✅";
      btnPrint.disabled = false;
      printStatus.textContent = "Generate & Print enabled ✅";
    }, 2000);
  }
  
  // Event listeners
  if (btnConnect) btnConnect.onclick = connect;
  if (btnDisconnect) btnDisconnect.onclick = disconnect;
  if (btnLoadDemo) btnLoadDemo.onclick = loadDemo;
  if (btnPay) btnPay.onclick = pay;
  
  // Initialize
  updateNetworkIndicator();
  
})();
