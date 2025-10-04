# LastWish.eth - The Decentralized Solution

![LastWish.eth Banner](https://img.shields.io/badge/LastWish.eth-Decentralized%20Will%20Platform-purple?style=for-the-badge)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Ethereum](https://img.shields.io/badge/Ethereum-Mainnet-blue.svg)](https://ethereum.org/)
[![Web3](https://img.shields.io/badge/Web3-Enabled-green.svg)](https://web3.foundation/)

LastWish.eth is a revolutionary decentralized platform that enables cryptocurrency holders to create legally binding digital wills for their digital assets. Built on Ethereum blockchain technology, it provides a secure, transparent, and immutable solution for digital inheritance planning.

## 🌟 Features

### Core Functionality
- **Digital Will Creation**: Create comprehensive wills for cryptocurrency and NFT assets
- **Multi-Wallet Support**: Add up to 20 wallet addresses containing your digital assets
- **ENS Integration**: Full support for Ethereum Name Service (ENS) domains
- **Beneficiary Management**: Add multiple beneficiaries with detailed information
- **Asset Assignment**: Assign specific percentages of assets to different beneficiaries
- **Payment Processing**: Secure payment system with ENS holder discounts

### Technical Features
- **Web3 Wallet Integration**: Connect with MetaMask, Coinbase Wallet, and other Web3 wallets
- **Moralis API Integration**: Real-time asset loading and blockchain data
- **Responsive Design**: Mobile-friendly interface with dark theme
- **Local Storage**: Secure client-side data persistence
- **Session Management**: Off-chain session signing for enhanced security

## 🚀 Quick Start

### Prerequisites
- Modern web browser with Web3 wallet extension
- Ethereum wallet (MetaMask, Coinbase Wallet, etc.)
- Moralis API key
- WalletConnect Project ID

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ArtieFishal/lastwish.git
   cd lastwish
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   MORALIS_API_KEY=your_moralis_api_key_here
   WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
   ```

3. **Update configuration**
   
   Edit `src/config.js` with your API keys:
   ```javascript
   window.LASTWISH_CONFIG = {
     chainId: 1,
     payToAddress: "0x016ae25Ac494B123C40EDb2418d9b1FC2d62279b",
     payAmountEth: 0.0001,
     ensDiscountPercent: 20,
     n8nWebhookUrl: "",
     moralisApiKey: "YOUR_MORALIS_API_KEY_HERE",
     walletConnectProjectId: "YOUR_WALLETCONNECT_PROJECT_ID_HERE"
   };
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:8000`

## 📖 Usage Guide

### Creating Your Digital Will

1. **Connect Your Wallet**
   - Click "Connect" to link your Ethereum wallet
   - Sign the session for secure authentication

2. **Enter Owner Information**
   - Provide your full legal name
   - Add special instructions for your executor
   - Your primary wallet address will be automatically populated

3. **Add Additional Wallets**
   - Include up to 20 wallet addresses containing your assets
   - Support for both wallet addresses and ENS names
   - Automatic ENS resolution and validation

4. **Load Your Assets**
   - Click "Load Assets" to fetch your ERC-20 tokens and NFTs
   - Review your digital asset portfolio
   - Use "Load Demo Data" to test the platform

5. **Assign Assets to Beneficiaries**
   - Add beneficiaries with their contact information
   - Assign specific percentages of each asset
   - Support for wallet addresses and ENS names

6. **Complete Payment**
   - Pay the platform fee (0.0001 ETH)
   - ENS holders receive a 20% discount
   - Secure on-chain payment processing

7. **Generate Your Will**
   - Click "Generate & Print" to create your legal document
   - Download a printable PDF for notarization
   - Store securely for estate planning purposes

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Blockchain**: Ethereum Mainnet
- **APIs**: Moralis Web3 API, ENS Resolution
- **Wallet Integration**: WalletConnect, MetaMask
- **Styling**: Custom CSS with X.com-inspired dark theme

### File Structure
```
lastwish-eth/
├── index.html              # Main application entry point
├── src/
│   ├── styles.css          # Application styling
│   ├── app.js              # Main application logic
│   └── config.js           # Configuration settings
├── docs/                   # Documentation files
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions deployment
├── package.json            # Project metadata
├── .env.example           # Environment configuration template
├── .gitignore             # Git ignore rules
├── LICENSE                # MIT License
├── README.md              # This file
└── CONTRIBUTING.md        # Contribution guidelines
```

### Key Components

#### Configuration Management
The `config.js` file contains all platform settings including blockchain parameters, API keys, and payment configuration. This centralized approach ensures easy maintenance and deployment across different environments.

#### Wallet Integration
The application supports multiple wallet providers through a unified interface. Users can connect their preferred wallet, sign sessions for authentication, and perform secure transactions directly from the browser.

#### Asset Management
Integration with Moralis API enables real-time loading of user assets including ERC-20 tokens and NFTs. The platform automatically fetches balances, metadata, and current market values for comprehensive estate planning.

#### Beneficiary System
A flexible beneficiary management system allows users to add multiple recipients with detailed contact information. The platform supports both traditional wallet addresses and ENS names for improved usability.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MORALIS_API_KEY` | Moralis Web3 API key for blockchain data | Yes |
| `WALLETCONNECT_PROJECT_ID` | WalletConnect project identifier | Yes |
| `CHAIN_ID` | Ethereum network ID (1 for mainnet) | No |
| `PAY_TO_ADDRESS` | Payment recipient address | No |
| `PAY_AMOUNT_ETH` | Platform fee in ETH | No |
| `ENS_DISCOUNT_PERCENT` | Discount for ENS holders | No |
| `N8N_WEBHOOK_URL` | Optional webhook for automation | No |

### API Keys Setup

#### Moralis API Key
1. Visit [moralis.io](https://moralis.io/)
2. Create a free account
3. Navigate to "Web3 APIs"
4. Create a new project
5. Copy your API key

#### WalletConnect Project ID
1. Visit [cloud.walletconnect.com](https://cloud.walletconnect.com/)
2. Create an account
3. Create a new project
4. Copy your Project ID

## 🎨 Customization

### Styling
The application uses a custom CSS framework inspired by X.com's dark theme. Key design elements include:

- **Color Palette**: Dark background with purple, blue, and green accents
- **Typography**: System fonts for optimal readability
- **Layout**: Card-based design with responsive grid system
- **Interactions**: Smooth transitions and hover effects

### Branding
To customize the branding:

1. Update the title and description in `index.html`
2. Modify color variables in `src/styles.css`
3. Replace logo and favicon files
4. Update metadata in `package.json`

## 🔒 Security

### Best Practices
- **Client-Side Storage**: Sensitive data is stored locally in the browser
- **Session Management**: Off-chain session signing for authentication
- **API Key Protection**: Environment variables for sensitive configuration
- **Input Validation**: Comprehensive validation of user inputs
- **Secure Payments**: On-chain payment processing with transaction verification

### Security Considerations
- Never commit API keys to version control
- Use HTTPS for all production deployments
- Regularly update dependencies for security patches
- Implement proper error handling to prevent information disclosure
- Follow Web3 security best practices for wallet integration

## 🚀 Deployment

### GitHub Pages
The repository includes GitHub Actions workflow for automatic deployment to GitHub Pages:

1. Push your code to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Your site will be available at `https://ArtieFishal.github.io/lastwish`

### Custom Hosting
For custom hosting providers:

1. Build the project: `npm run build`
2. Upload all files to your web server
3. Ensure HTTPS is enabled
4. Configure your domain and SSL certificate

### IPFS Deployment
For decentralized hosting on IPFS:

1. Install IPFS CLI tools
2. Add your project to IPFS: `ipfs add -r .`
3. Pin your content for persistence
4. Access via IPFS gateway or ENS domain

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Development setup
- Code style guidelines
- Testing procedures
- Pull request process
- Security considerations

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](docs/api.md)
- [User Guide](docs/user-guide.md)
- [Developer Guide](docs/developer-guide.md)

### Community
- GitHub Issues: Report bugs and request features
- Discussions: Join community conversations
- Discord: Real-time chat and support

### Frequently Asked Questions

**Q: Is my data secure?**
A: Yes, all sensitive data is stored locally in your browser and never transmitted to external servers except for blockchain transactions.

**Q: What cryptocurrencies are supported?**
A: The platform supports all ERC-20 tokens and NFTs on the Ethereum mainnet.

**Q: Can I use testnet for development?**
A: Yes, update the `chainId` in `config.js` to use Ethereum testnets like Goerli or Sepolia.

**Q: Is the generated will legally binding?**
A: The platform generates a document that can be notarized according to your local laws. Consult with a legal professional for specific requirements.

## 🔮 Roadmap

### Version 2.0
- Multi-chain support (Polygon, BSC, Arbitrum)
- Smart contract automation for inheritance execution
- Mobile application for iOS and Android
- Integration with traditional legal services

### Version 3.0
- Decentralized storage on IPFS
- DAO governance for platform decisions
- Advanced asset management features
- Integration with DeFi protocols

---

**Built with ❤️ for the decentralized future**

*LastWish.eth - Securing your digital legacy on the blockchain*

