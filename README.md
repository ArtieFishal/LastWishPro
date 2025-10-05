# LastWish.eth - Digital Asset Inheritance Platform

A comprehensive Next.js application for creating digital wills and managing cryptocurrency inheritance, built according to the development plan outlined in `LastWishV1—Top‑downBuildPlan+Next.pdf`.

## 🚀 Features

### Core Functionality
- **Owner Profile Management** - Complete user onboarding with legal name and special instructions
- **Multi-Wallet Support** - Connect and manage multiple cryptocurrency wallets
- **Asset Discovery** - Automatic detection of tokens and NFTs across supported blockchains
- **Beneficiary Management** - Add and manage inheritance beneficiaries with contact information
- **Asset Assignment** - Percentage-based distribution of digital assets to beneficiaries
- **PDF Generation** - Generate legal documents for notarization and estate planning
- **Real-time Validation** - Ensure all assignments total 100% before document generation

### Technical Features
- **Next.js 15** with App Router for modern React development
- **TypeScript** for type safety and better developer experience
- **Zustand** for state management with localStorage persistence
- **Wagmi + RainbowKit** for Web3 wallet integration
- **React Hook Form + Zod** for form validation
- **@react-pdf/renderer** for PDF document generation
- **Tailwind CSS** for responsive styling
- **Netlify Functions** for serverless API endpoints

## 📁 Project Structure

```
lastwish-eth/
├── app/                          # Next.js App Router pages
│   ├── onboarding/              # Owner profile setup
│   ├── wallets/                 # Wallet connection
│   ├── assets/                  # Asset discovery
│   ├── beneficiaries/           # Beneficiary management
│   ├── assignments/             # Asset assignment matrix
│   └── generate/                # PDF document generation
├── lib/                         # Shared utilities and configuration
│   ├── types.ts                 # TypeScript type definitions
│   ├── store.ts                 # Zustand state management
│   ├── providers.tsx            # React providers setup
│   └── wagmi.ts                 # Web3 configuration
├── netlify/functions/           # Serverless API endpoints
│   ├── ens-resolve.ts           # ENS name resolution
│   ├── assets.ts                # Asset data fetching
│   ├── payment-verify.ts        # Payment verification
│   └── n8n-notify.ts            # N8N workflow integration
├── components/                  # Reusable UI components
├── public/                      # Static assets
└── netlify.toml                 # Netlify deployment configuration
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lastwish-eth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your API keys:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   ALCHEMY_KEY=your_alchemy_api_key
   COVALENT_KEY=your_covalent_api_key
   ETHERSCAN_KEY=your_etherscan_api_key
   PAYMENT_RECEIVER=0x_your_payment_address
   N8N_WEBHOOK_URL=your_n8n_webhook_url
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 API Keys Required

### Required for Full Functionality
- **WalletConnect Project ID** - Get from [cloud.walletconnect.com](https://cloud.walletconnect.com/)
- **Alchemy API Key** - Get from [alchemy.com](https://alchemy.com/) for ENS resolution
- **Covalent API Key** - Get from [covalenthq.com](https://covalenthq.com/) for asset data
- **Etherscan API Key** - Get from [etherscan.io](https://etherscan.io/) for payment verification

### Optional
- **Web3.Storage Token** - For IPFS integration
- **N8N Webhook URL** - For workflow automation

## 🚀 Deployment

### Netlify (Recommended)

1. **Connect your repository to Netlify**
2. **Set environment variables** in Netlify dashboard
3. **Deploy** - Netlify will automatically build and deploy

### Manual Build

```bash
npm run build
npm run export
```

The static files will be generated in the `out/` directory.

## 📋 User Workflow

1. **Onboarding** - Complete owner profile with legal name and special instructions
2. **Wallet Connection** - Connect cryptocurrency wallets using MetaMask or WalletConnect
3. **Asset Discovery** - Automatically load tokens and NFTs from connected wallets
4. **Beneficiary Setup** - Add inheritance beneficiaries with contact information
5. **Asset Assignment** - Assign percentage ownership of each asset to beneficiaries
6. **Document Generation** - Generate PDF documents for notarization and legal use

## 🔒 Security Features

- **Client-side Storage** - All data stored locally in browser (no server database)
- **Wallet Signature Verification** - Real wallet connection and signature verification
- **Input Validation** - Comprehensive form validation using Zod schemas
- **CORS Protection** - Proper CORS headers on all API endpoints
- **Environment Variables** - All sensitive data stored in environment variables

## 🧪 Testing

The application includes demo mode functionality:
- Mock wallet connections for testing
- Sample asset data for demonstration
- Local storage persistence for development
- Fallback to demo data when APIs are unavailable

## 📚 Documentation

- **Development Plan** - See `LastWishV1—Top‑downBuildPlan+Next.pdf` for detailed architecture
- **API Documentation** - Netlify functions documented in `/netlify/functions/`
- **Type Definitions** - Complete TypeScript types in `/lib/types.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Legal Disclaimer

This platform provides tools for creating digital wills but does not constitute legal advice. Users should consult with qualified legal professionals for estate planning guidance specific to their jurisdiction.

## 🆘 Support

For questions or support:
- Check the documentation in `/docs/`
- Review the development plan PDF
- Open an issue on GitHub

---

**Built with ❤️ using Next.js, TypeScript, and Web3 technologies**
