export interface WalletData {
  name: string;
  type: string[];
  blockchains: string[];
  userBase: string;
  openSource: boolean;
  protocols: string[];
  description: string;
  website: string;
  features: string[];
}

export const walletData: WalletData[] = [
  {
    name: "MetaMask",
    type: ["Browser Extension", "Mobile App"],
    blockchains: ["Ethereum", "Polygon", "BSC", "Avalanche", "Arbitrum", "Optimism"],
    userBase: "100M+",
    openSource: true,
    protocols: ["EIP-1193", "WalletConnect", "EIP-6963"],
    description: "Most popular Ethereum wallet with browser extension and mobile app",
    website: "https://metamask.io",
    features: ["DeFi Integration", "NFT Support", "Hardware Wallet Support", "Multi-Chain"]
  },
  {
    name: "Phantom",
    type: ["Browser Extension", "Mobile App"],
    blockchains: ["Solana", "Ethereum", "Polygon"],
    userBase: "15M+",
    openSource: false,
    protocols: ["Solana Wallet Adapter", "WalletConnect"],
    description: "Leading Solana wallet with multi-chain support",
    website: "https://phantom.app",
    features: ["Solana DeFi", "NFT Support", "Staking", "Multi-Chain"]
  },
  {
    name: "WalletConnect",
    type: ["Protocol"],
    blockchains: ["Ethereum", "Polygon", "BSC", "Avalanche", "Solana", "Cosmos"],
    userBase: "47.5M+",
    openSource: true,
    protocols: ["WalletConnect v2", "WalletConnect v1"],
    description: "Open protocol for connecting wallets to dApps",
    website: "https://walletconnect.com",
    features: ["Cross-Chain", "QR Code Connection", "Deep Linking", "Push Notifications"]
  },
  {
    name: "Ledger",
    type: ["Hardware Wallet"],
    blockchains: ["Bitcoin", "Ethereum", "Solana", "Cardano", "Polkadot", "Cosmos"],
    userBase: "5M+",
    openSource: true,
    protocols: ["Ledger Live", "WebHID", "WebUSB"],
    description: "Leading hardware wallet for secure crypto storage",
    website: "https://ledger.com",
    features: ["Hardware Security", "Multi-Chain", "Staking", "DeFi Integration"]
  },
  {
    name: "Trezor",
    type: ["Hardware Wallet"],
    blockchains: ["Bitcoin", "Ethereum", "Litecoin", "Cardano", "Monero"],
    userBase: "1M+",
    openSource: true,
    protocols: ["Trezor Connect", "WebUSB"],
    description: "First hardware wallet with open-source firmware",
    website: "https://trezor.io",
    features: ["Hardware Security", "Open Source", "Password Manager", "Multi-Chain"]
  },
  {
    name: "Coinbase Wallet",
    type: ["Mobile App", "Browser Extension"],
    blockchains: ["Ethereum", "Polygon", "Avalanche", "BSC", "Optimism"],
    userBase: "10M+",
    openSource: false,
    protocols: ["WalletConnect", "Coinbase Wallet SDK"],
    description: "Self-custody wallet by Coinbase exchange",
    website: "https://wallet.coinbase.com",
    features: ["DeFi Integration", "NFT Support", "Easy Onboarding", "Multi-Chain"]
  },
  {
    name: "Trust Wallet",
    type: ["Mobile App"],
    blockchains: ["Ethereum", "BSC", "Polygon", "Solana", "Bitcoin", "Cosmos"],
    userBase: "25M+",
    openSource: true,
    protocols: ["WalletConnect", "Trust Wallet Core"],
    description: "Multi-chain mobile wallet owned by Binance",
    website: "https://trustwallet.com",
    features: ["Multi-Chain", "DeFi Integration", "Staking", "NFT Support"]
  },
  {
    name: "Keplr",
    type: ["Browser Extension", "Mobile App"],
    blockchains: ["Cosmos", "Osmosis", "Juno", "Stargaze", "Akash"],
    userBase: "2M+",
    openSource: true,
    protocols: ["Cosmos Kit", "Keplr API", "CosmJS"],
    description: "Leading wallet for Cosmos ecosystem",
    website: "https://keplr.app",
    features: ["Cosmos Ecosystem", "IBC Transfers", "Staking", "Governance"]
  },
  {
    name: "Rainbow",
    type: ["Mobile App"],
    blockchains: ["Ethereum", "Polygon", "Arbitrum", "Optimism", "BSC"],
    userBase: "3M+",
    openSource: true,
    protocols: ["WalletConnect", "Rainbow Kit"],
    description: "Colorful and user-friendly Ethereum wallet",
    website: "https://rainbow.me",
    features: ["Beautiful UI", "DeFi Integration", "NFT Support", "Multi-Chain"]
  },
  {
    name: "Atomic Wallet",
    type: ["Desktop App", "Mobile App"],
    blockchains: ["Bitcoin", "Ethereum", "Litecoin", "Cardano", "Polkadot", "Cosmos"],
    userBase: "5M+",
    openSource: false,
    protocols: ["Atomic Swaps", "Built-in Exchange"],
    description: "Multi-currency wallet with built-in atomic swaps",
    website: "https://atomicwallet.io",
    features: ["Atomic Swaps", "Built-in Exchange", "Staking", "Multi-Chain"]
  },
  {
    name: "Exodus",
    type: ["Desktop App", "Mobile App"],
    blockchains: ["Bitcoin", "Ethereum", "Solana", "Cardano", "Polkadot", "Cosmos"],
    userBase: "6M+",
    openSource: false,
    protocols: ["Built-in Exchange", "Trezor Integration"],
    description: "User-friendly multi-chain wallet with built-in exchange",
    website: "https://exodus.com",
    features: ["Beautiful UI", "Built-in Exchange", "Hardware Wallet Support", "Multi-Chain"]
  },
  {
    name: "Solflare",
    type: ["Browser Extension", "Mobile App", "Web Wallet"],
    blockchains: ["Solana"],
    userBase: "1M+",
    openSource: true,
    protocols: ["Solana Wallet Adapter", "Ledger Integration"],
    description: "Popular Solana wallet with hardware wallet support",
    website: "https://solflare.com",
    features: ["Solana DeFi", "NFT Support", "Staking", "Hardware Wallet Support"]
  },
  {
    name: "Backpack",
    type: ["Browser Extension", "Mobile App"],
    blockchains: ["Solana", "Ethereum"],
    userBase: "500K+",
    openSource: true,
    protocols: ["Solana Wallet Adapter", "xNFT Support"],
    description: "Next-generation wallet with xNFT support",
    website: "https://backpack.app",
    features: ["xNFT Support", "Multi-Chain", "DeFi Integration", "Social Features"]
  },
  {
    name: "Glow",
    type: ["Browser Extension", "Mobile App"],
    blockchains: ["Solana"],
    userBase: "200K+",
    openSource: true,
    protocols: ["Solana Wallet Adapter", "Glow API"],
    description: "Solana wallet focused on staking and governance",
    website: "https://glow.app",
    features: ["Staking Focus", "Governance", "Validator Selection", "DeFi Integration"]
  },
  {
    name: "Polkadot.js",
    type: ["Browser Extension", "Web App"],
    blockchains: ["Polkadot", "Kusama", "Substrate Chains"],
    userBase: "500K+",
    openSource: true,
    protocols: ["Polkadot.js Extension", "Substrate Connect"],
    description: "Official wallet and interface for Polkadot ecosystem",
    website: "https://polkadot.js.org",
    features: ["Polkadot Ecosystem", "Governance", "Staking", "Cross-Chain"]
  },
  {
    name: "Talisman",
    type: ["Browser Extension"],
    blockchains: ["Polkadot", "Kusama", "Ethereum", "Substrate Chains"],
    userBase: "100K+",
    openSource: true,
    protocols: ["Polkadot.js Extension", "EVM Support"],
    description: "Multi-chain wallet for Polkadot and Ethereum",
    website: "https://talisman.xyz",
    features: ["Multi-Chain", "Beautiful UI", "Portfolio Tracking", "Cross-Chain"]
  },
  {
    name: "NEAR Wallet",
    type: ["Web Wallet"],
    blockchains: ["NEAR"],
    userBase: "1M+",
    openSource: true,
    protocols: ["NEAR Wallet Selector", "NEAR API JS"],
    description: "Official web wallet for NEAR Protocol",
    website: "https://wallet.near.org",
    features: ["NEAR Ecosystem", "Easy Onboarding", "DeFi Integration", "Staking"]
  },
  {
    name: "Nami",
    type: ["Browser Extension"],
    blockchains: ["Cardano"],
    userBase: "200K+",
    openSource: true,
    protocols: ["CIP-30", "Cardano Serialization Lib"],
    description: "Popular Cardano wallet with DeFi support",
    website: "https://namiwallet.io",
    features: ["Cardano DeFi", "NFT Support", "Staking", "Light Wallet"]
  },
  {
    name: "Eternl",
    type: ["Browser Extension", "Mobile App"],
    blockchains: ["Cardano"],
    userBase: "150K+",
    openSource: false,
    protocols: ["CIP-30", "Hardware Wallet Support"],
    description: "Feature-rich Cardano wallet with advanced features",
    website: "https://eternl.io",
    features: ["Advanced Features", "Hardware Wallet Support", "Multi-Account", "Portfolio Tracking"]
  },
  {
    name: "Unisat",
    type: ["Browser Extension"],
    blockchains: ["Bitcoin"],
    userBase: "300K+",
    openSource: false,
    protocols: ["BIP-322", "Ordinals", "BRC-20"],
    description: "Bitcoin wallet focused on Ordinals and BRC-20 tokens",
    website: "https://unisat.io",
    features: ["Ordinals Support", "BRC-20 Tokens", "Bitcoin DeFi", "Inscriptions"]
  },
  {
    name: "Xverse",
    type: ["Browser Extension", "Mobile App"],
    blockchains: ["Bitcoin", "Stacks"],
    userBase: "100K+",
    openSource: true,
    protocols: ["Bitcoin", "Stacks Connect"],
    description: "Bitcoin and Stacks wallet with smart contract support",
    website: "https://xverse.app",
    features: ["Bitcoin", "Stacks Smart Contracts", "NFT Support", "DeFi Integration"]
  },
  {
    name: "Core",
    type: ["Browser Extension", "Mobile App"],
    blockchains: ["Avalanche", "Bitcoin", "Ethereum"],
    userBase: "2M+",
    openSource: true,
    protocols: ["Avalanche.js", "Core Connect"],
    description: "Official wallet for Avalanche ecosystem",
    website: "https://core.app",
    features: ["Avalanche Ecosystem", "Multi-Chain", "Staking", "Bridge Integration"]
  },
  {
    name: "1inch Wallet",
    type: ["Mobile App"],
    blockchains: ["Ethereum", "BSC", "Polygon", "Arbitrum", "Optimism"],
    userBase: "500K+",
    openSource: false,
    protocols: ["1inch API", "WalletConnect"],
    description: "DeFi-focused wallet by 1inch DEX aggregator",
    website: "https://1inch.io/wallet",
    features: ["DeFi Focus", "DEX Aggregation", "Gas Optimization", "Multi-Chain"]
  },
  {
    name: "Argent",
    type: ["Mobile App"],
    blockchains: ["Ethereum", "StarkNet"],
    userBase: "2M+",
    openSource: true,
    protocols: ["Account Abstraction", "WalletConnect"],
    description: "Smart contract wallet with social recovery",
    website: "https://argent.xyz",
    features: ["Social Recovery", "Account Abstraction", "DeFi Integration", "Gas Sponsorship"]
  },
  {
    name: "Zerion",
    type: ["Mobile App", "Web App"],
    blockchains: ["Ethereum", "Polygon", "BSC", "Arbitrum", "Optimism"],
    userBase: "1M+",
    openSource: false,
    protocols: ["WalletConnect", "Zerion API"],
    description: "DeFi wallet with portfolio tracking and analytics",
    website: "https://zerion.io",
    features: ["Portfolio Tracking", "DeFi Analytics", "Multi-Chain", "Beautiful UI"]
  }
];

