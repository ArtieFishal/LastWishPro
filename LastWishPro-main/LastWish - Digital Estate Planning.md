# LastWish - Digital Estate Planning

A privacy-first estate planning web application for digital assets built with Next.js and deployed on Netlify.

## Features

- **Owner Onboarding**: Collect owner information and special instructions
- **Wallet Integration**: Connect wallets using WalletConnect/RainbowKit
- **Asset Discovery**: Automatically load tokens and NFTs from connected wallets
- **Beneficiary Management**: Add and manage beneficiaries with contact information
- **Asset Assignment**: Assign percentage splits of assets to beneficiaries
- **Payment Processing**: Crypto payment verification for services
- **Document Generation**: Generate printable legal will documents
- **n8n Integration**: Workflow automation for compliance and notifications
- **IPFS Storage**: Optional decentralized storage for estate data

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with dark theme (X.com inspired)
- **State Management**: Zustand with localStorage persistence
- **Wallet Integration**: wagmi, RainbowKit, viem
- **PDF Generation**: @react-pdf/renderer
- **Backend**: Netlify Functions (serverless)
- **APIs**: Alchemy, Covalent, Etherscan, web3.storage
- **Automation**: n8n workflows

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- API keys for external services

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lastwish-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:
- `ALCHEMY_KEY`: Alchemy API key for ENS resolution and blockchain data
- `COVALENT_KEY`: Covalent API key for asset fetching
- `WEB3_STORAGE_TOKEN`: web3.storage token for IPFS pinning
- `N8N_WEBHOOK_URL`: n8n webhook URL for workflow automation
- `ETHERSCAN_KEY`: Etherscan API key for payment verification
- `PAYMENT_RECEIVER`: Ethereum address to receive payments
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: WalletConnect project ID

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Netlify Deployment

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `out`
4. Configure environment variables in Netlify dashboard
5. Deploy!

### Environment Variables for Production

Set these in your Netlify dashboard under Site Settings > Environment Variables:

- `ALCHEMY_KEY`
- `COVALENT_KEY`
- `WEB3_STORAGE_TOKEN`
- `N8N_WEBHOOK_URL`
- `ETHERSCAN_KEY`
- `PAYMENT_RECEIVER`

## API Endpoints

### Netlify Functions

- `GET /api/ens-resolve?name=vitalik.eth` - Resolve ENS names to addresses
- `GET /api/assets?address=0x...&chains=1,137` - Fetch tokens and NFTs
- `POST /api/payment-verify` - Verify payment transactions
- `POST /api/n8n-notify` - Send notifications to n8n workflows
- `POST /api/ipfs-pin` - Pin JSON data to IPFS

## Architecture

```
Next.js (App Router, static export)
├─ Client-only state management (Zustand)
├─ Wallet integration (wagmi + RainbowKit)
├─ PDF generation (react-pdf)
└─ Netlify Functions
   ├─ ENS resolution (Alchemy)
   ├─ Asset fetching (Covalent)
   ├─ Payment verification (Etherscan)
   ├─ IPFS pinning (web3.storage)
   └─ n8n notifications
```

## Data Model

The application uses TypeScript interfaces for type safety:

- `Owner`: Testator information and instructions
- `Wallet`: Connected wallet addresses and ENS names
- `TokenAsset`: ERC-20 token information and balances
- `NFTAsset`: NFT collection and token details
- `Beneficiary`: Beneficiary contact and relationship info
- `Assignment`: Asset-to-beneficiary percentage assignments
- `LastWishState`: Complete application state

## Security & Privacy

- All API keys stored securely in Netlify Functions
- No PII sent to third-party APIs (only derived data)
- Local-only mode available (no network calls)
- CORS restrictions for production domains
- Rate limiting on API endpoints

## n8n Workflow Integration

The application integrates with n8n for:

- **Compliance Monitoring**: Nightly legal source checks
- **User Progress Tracking**: Document generation metrics
- **Content Updates**: FAQ and legal content refresh
- **Notification System**: Email alerts and status updates

## Legal Compliance

The generated will documents are designed to be:

- Printable and notarizable in most US states
- Compliant with digital asset estate planning requirements
- Reviewable by qualified attorneys
- Executable according to state-specific will requirements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Review the documentation

## Roadmap

- [ ] Multi-chain support (Polygon, Arbitrum, etc.)
- [ ] Advanced assignment rules and conditions
- [ ] Integration with legal service providers
- [ ] Mobile app development
- [ ] Enhanced n8n workflow templates
- [ ] Decentralized deployment (IPFS/ICP)

