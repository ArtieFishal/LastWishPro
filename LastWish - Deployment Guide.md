# LastWish - Deployment Guide

## Quick Deploy to Netlify

### 1. Repository Setup
```bash
git init
git add .
git commit -m "Initial commit: LastWish estate planning app"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Netlify Deployment
1. Go to [Netlify](https://netlify.com) and sign in
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
   - **Node version**: `20`

### 3. Environment Variables
Set these in Netlify Dashboard → Site Settings → Environment Variables:

**Required for full functionality:**
```
ALCHEMY_KEY=your_alchemy_api_key
COVALENT_KEY=your_covalent_api_key
WEB3_STORAGE_TOKEN=your_web3_storage_token
N8N_WEBHOOK_URL=your_n8n_webhook_url
ETHERSCAN_KEY=your_etherscan_api_key
PAYMENT_RECEIVER=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b
```

**Optional (for wallet integration):**
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 4. API Keys Setup

#### Alchemy (ENS Resolution & Blockchain Data)
1. Go to [Alchemy](https://alchemy.com)
2. Create account and new app
3. Copy API key to `ALCHEMY_KEY`

#### Covalent (Asset Fetching)
1. Go to [Covalent](https://covalenthq.com)
2. Sign up for API access
3. Copy API key to `COVALENT_KEY`

#### Web3.Storage (IPFS Pinning)
1. Go to [Web3.Storage](https://web3.storage)
2. Create account and generate token
3. Copy token to `WEB3_STORAGE_TOKEN`

#### Etherscan (Payment Verification)
1. Go to [Etherscan](https://etherscan.io/apis)
2. Create account and generate API key
3. Copy key to `ETHERSCAN_KEY`

#### WalletConnect (Wallet Integration)
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create project and get Project ID
3. Copy to `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### 5. n8n Workflow Setup (Optional)
1. Set up n8n instance (cloud or self-hosted)
2. Create webhook endpoint
3. Copy webhook URL to `N8N_WEBHOOK_URL`

### 6. Demo Mode
The app works in demo mode without API keys:
- Mock data is provided for assets
- Payment verification is simulated
- PDF generation works offline
- n8n notifications are optional

### 7. Custom Domain (Optional)
1. In Netlify Dashboard → Domain Settings
2. Add custom domain
3. Configure DNS records
4. Enable HTTPS (automatic)

### 8. Performance Optimization
- Enable Netlify's asset optimization
- Configure caching headers
- Enable compression
- Use Netlify Analytics

## Troubleshooting

### Build Issues
- Ensure Node.js 20+ is used
- Check all dependencies are installed
- Verify TypeScript compilation

### Runtime Issues
- Check browser console for errors
- Verify API keys are set correctly
- Test with demo mode first

### Wallet Connection Issues
- Ensure WalletConnect Project ID is valid
- Check browser wallet extensions
- Test with different wallets

## Security Notes
- All API keys are server-side only
- No sensitive data in client code
- CORS properly configured
- Rate limiting on API endpoints

## Support
- Check GitHub issues
- Review documentation
- Test in demo mode first

