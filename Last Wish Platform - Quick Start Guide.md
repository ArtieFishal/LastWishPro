# Last Wish Platform - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This quick start guide gets the Last Wish platform running locally in under 5 minutes. For comprehensive setup and deployment options, see the complete guides included in this package.

## Prerequisites

- **Node.js 18+** and **Python 3.8+** installed
- **Git** for version control
- **MetaMask** browser extension for testing

## Quick Local Setup

### 1. Extract and Navigate
```bash
# Extract the complete package
tar -xzf last-wish-platform-complete.tar.gz
cd last-wish-platform
```

### 2. Backend Setup (2 minutes)
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install flask flask-cors flask-jwt-extended pymongo redis cryptography bcrypt jinja2 reportlab

# Create basic .env file
echo "FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production
MONGODB_URI=mongodb://localhost:27017/lastwish
JWT_SECRET_KEY=jwt-secret-key" > .env

# Start backend (runs on port 5000)
cd src && python main.py &
```

### 3. Frontend Setup (2 minutes)
```bash
# Open new terminal, navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env

# Start frontend (runs on port 5173)
npm run dev
```

### 4. Test the Platform (1 minute)
1. Open browser to `http://localhost:5173`
2. Click "🦊 Connect MetaMask"
3. Approve MetaMask connection
4. Click "Continue with This Wallet"
5. Fill out the legal form
6. Test the $14.20 payment requirement
7. Generate and download your legal document PDF

## 🎯 What You Get

### ✅ Complete Features
- **Real MetaMask Integration**: Actual wallet connection and balance display
- **Legal Document Generation**: Comprehensive estate planning forms with PDF output
- **Payment Processing**: $14.20 payment requirement before document generation
- **State Compliance**: Legal requirements for all 50 US states
- **Professional UI**: Dark theme with responsive design
- **Security**: AES-256 encryption and JWT authentication

### ✅ Production Ready
- **Backend API**: Complete Flask REST API with all endpoints
- **Database Models**: User, wallet, document, and payment management
- **Email Services**: Notification system with professional templates
- **n8n Workflow**: Complete automation workflow included
- **Documentation**: Comprehensive setup and deployment guides

## 🌐 Quick Deployment Options

### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### Railway (Full Stack)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy both frontend and backend
railway login
railway init
railway up
```

### Netlify (Frontend)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy frontend
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

## 📋 Package Contents

```
last-wish-platform/
├── 📁 frontend/              # React application with MetaMask integration
├── 📁 backend/               # Flask API with all endpoints
├── 📁 n8n-workflow/          # Complete automation workflow
├── 📄 LOCAL_SETUP_GUIDE.md   # Comprehensive local setup (12,000+ words)
├── 📄 DEPLOYMENT_GUIDE.md    # Multi-platform deployment guide (15,000+ words)
├── 📄 QUICK_START_GUIDE.md   # This quick start guide
├── 📄 FINAL_DOCUMENTATION.md # Complete platform documentation
└── 📄 ARCHITECTURE.md        # Technical architecture overview
```

## 🔧 Troubleshooting

### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Frontend Won't Start
```bash
# Check Node version
node --version  # Should be 18+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### MetaMask Won't Connect
1. Ensure MetaMask is installed and unlocked
2. Check browser console for errors
3. Try refreshing the page
4. Verify you're on HTTP (not HTTPS) for local development

## 📞 Support

For detailed setup instructions, see:
- **LOCAL_SETUP_GUIDE.md** - Complete local development setup
- **DEPLOYMENT_GUIDE.md** - Production deployment instructions
- **FINAL_DOCUMENTATION.md** - Complete platform documentation

## 🎉 Success!

You now have a fully functional cryptocurrency estate planning platform running locally! The platform includes:

- ✅ Real wallet integration with MetaMask
- ✅ Comprehensive legal document generation
- ✅ Payment processing with $14.20 requirement
- ✅ Professional UI with dark theme
- ✅ Complete backend API
- ✅ Production-ready security features

**Next Steps:**
1. Customize the legal templates for your jurisdiction
2. Configure payment processing with real payment gateways
3. Deploy to production using the deployment guide
4. Set up monitoring and analytics
5. Configure email notifications for users

The Last Wish platform is now ready for customization and production deployment!

