# Crypto Wallet Connect Models - Comprehensive Comparison Matrix

A comprehensive, interactive comparison matrix for cryptocurrency wallet connection models across multiple blockchains. Built with Next.js, TypeScript, and Tailwind CSS.

![Crypto Wallet Matrix](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🚀 Features

### 📊 Comprehensive Wallet Comparison
- **25+ Major Wallets** including MetaMask, Phantom, Keplr, Ledger, Trezor, and more
- **Advanced Filtering & Sorting** by wallet type, blockchain, user base, and more
- **Statistics Dashboard** with real-time metrics
- **Detailed Wallet Information** including protocols, features, and user bases

### 🔗 Multi-Chain Wallet Connection
- **6 Blockchain Networks**: Ethereum, Solana, Cosmos, Polkadot, Bitcoin, Cardano
- **Real-time Connection Status** with visual indicators
- **Mock Wallet Integration** for demonstration purposes
- **Protocol Information** for each blockchain ecosystem

### 🚀 dApp Integration
- **Popular dApps** for each blockchain (Uniswap, Jupiter, Osmosis, etc.)
- **Active Connection Management** - track and manage dApp connections
- **Connect/Disconnect Functionality** for seamless interaction

### 💰 Asset Viewing
- **Multi-Chain Portfolio** display across connected wallets
- **Address & Balance Information** for each blockchain
- **Clean Interface** for asset management

### 🎨 Modern UI/UX
- **Responsive Design** - works on desktop and mobile
- **Dark/Light Mode Toggle**
- **Professional Interface** using shadcn/ui components
- **Smooth Animations** and transitions

## 🛠 Tech Stack

- **Framework**: Next.js 15.5.2
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Build Tool**: Turbopack
- **Deployment**: Static Export

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/crypto-wallet-matrix.git
   cd crypto-wallet-matrix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Build & Deploy

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Static Export (for GitHub Pages, Netlify, Vercel)
```bash
npm run build        # Builds and exports static files to /out
```

The static files will be generated in the `/out` directory, ready for deployment to any static hosting service.

## 📁 Project Structure

```
crypto-wallet-matrix/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       └── tabs.tsx
│   ├── data/
│   │   └── wallets.ts
│   └── lib/
│       └── utils.ts
├── public/
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🔧 Configuration

### Environment Variables
No environment variables required for basic functionality.

### Next.js Configuration
The project is configured for static export in `next.config.js`:

```javascript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}
```

## 📊 Supported Wallets

### Hardware Wallets
- Ledger
- Trezor

### Browser Extensions
- MetaMask
- Phantom
- Keplr
- Nami
- Unisat
- And more...

### Mobile Apps
- Trust Wallet
- Coinbase Wallet
- Rainbow
- Exodus
- And more...

## 🌐 Supported Blockchains

| Blockchain | Icon | Popular Wallets | Protocols |
|------------|------|-----------------|-----------|
| Ethereum | ⟠ | MetaMask, Rainbow, Coinbase Wallet | EIP-1193, WalletConnect |
| Solana | ◎ | Phantom, Solflare, Backpack | Solana Wallet Adapter |
| Cosmos | ⚛ | Keplr, Cosmostation | Cosmos Kit, CosmJS |
| Polkadot | ● | Polkadot.js, Talisman | Polkadot.js Extension |
| Bitcoin | ₿ | Unisat, Xverse | BIP-322, Ordinals |
| Cardano | ₳ | Nami, Eternl | CIP-30 |

## 🎯 Use Cases

- **Developers**: Compare wallet integration options for dApps
- **Users**: Find the best wallet for their needs across different blockchains
- **Researchers**: Analyze wallet adoption and feature sets
- **Educators**: Teach about wallet technologies and blockchain ecosystems

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [Radix UI](https://radix-ui.com/) for accessible UI primitives
- [shadcn/ui](https://ui.shadcn.com/) for beautiful component designs
- [Lucide](https://lucide.dev/) for the icon library

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Review existing issues for solutions

---

**Built with ❤️ for the crypto community**
