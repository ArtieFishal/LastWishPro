# Last Wish Platform - Complete Local Setup Guide

## Overview

The Last Wish platform is a comprehensive cryptocurrency estate planning solution that enables users to create legally compliant addendums to their wills or trusts for digital assets. This guide provides everything you need to run the complete platform locally on your machine.

## What's Included

This complete code package includes:

- **Frontend Application**: React-based user interface with MetaMask integration
- **Backend API**: Flask-based REST API with comprehensive endpoints
- **Database Models**: Complete data models for users, wallets, documents, and payments
- **Legal Templates**: State-specific legal document templates
- **Payment Processing**: Cryptocurrency and credit card payment integration
- **Email Services**: Comprehensive notification and email system
- **Security Features**: AES-256 encryption, JWT authentication, and security middleware
- **n8n Workflow**: Complete automation workflow for user journey
- **Documentation**: Comprehensive API documentation and user guides

## System Requirements

### Prerequisites

Before setting up the Last Wish platform locally, ensure you have the following installed:

- **Python 3.8+** (Python 3.11 recommended)
- **Node.js 18+** (Node.js 20 recommended)
- **npm or pnpm** (pnpm recommended for faster installs)
- **Git** (for version control)
- **MongoDB** (for database storage)
- **Redis** (for caching and session management)
- **MetaMask Browser Extension** (for wallet integration testing)

### Optional but Recommended

- **Docker** (for containerized deployment)
- **PostgreSQL** (alternative to MongoDB)
- **n8n** (for workflow automation)

## Directory Structure

```
last-wish-platform/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts for state management
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS and styling files
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── backend/                 # Flask backend application
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── utils/          # Utility functions
│   │   ├── middleware/     # Security and performance middleware
│   │   └── main.py         # Flask application entry point
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment configuration
├── n8n-workflow/           # n8n automation workflow
├── docs/                   # Documentation
└── scripts/               # Setup and deployment scripts
```



## Installation Instructions

### Step 1: Clone or Download the Project

If you have the project files, extract them to your desired directory. If you're setting up from scratch, create the directory structure as shown above.

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory

```bash
cd last-wish-platform/backend
```

#### 2.2 Create Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

#### 2.3 Install Python Dependencies

```bash
pip install -r requirements.txt
```

If the requirements.txt file is missing, install the core dependencies:

```bash
pip install flask flask-cors flask-jwt-extended flask-limiter flask-compress
pip install pymongo redis cryptography bcrypt
pip install jinja2 reportlab schedule
pip install python-dotenv requests
```

#### 2.4 Configure Environment Variables

Create a `.env` file in the backend directory with the following configuration:

```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-super-secret-key-change-this-in-production

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/lastwish
REDIS_URL=redis://localhost:6379/0

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRES=3600

# Email Configuration (Optional - for notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Payment Configuration (Optional - for production)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Security Configuration
ENCRYPTION_KEY=your-32-byte-encryption-key-base64-encoded
RATE_LIMIT_STORAGE_URL=redis://localhost:6379/1

# API Keys (Optional)
ETHERSCAN_API_KEY=your-etherscan-api-key
COINBASE_API_KEY=your-coinbase-api-key
```

#### 2.5 Start Database Services

Ensure MongoDB and Redis are running:

```bash
# Start MongoDB (if installed locally)
mongod

# Start Redis (if installed locally)
redis-server
```

Alternatively, use Docker:

```bash
# Start MongoDB with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Start Redis with Docker
docker run -d -p 6379:6379 --name redis redis:latest
```

#### 2.6 Initialize Database

Run the database initialization script:

```bash
python src/utils/seed_legal_data.py
```

#### 2.7 Start Backend Server

```bash
cd src
python main.py
```

The backend server will start on `http://localhost:5000`. You should see output similar to:

```
 * Running on http://localhost:5000
 * Debug mode: on
 * Database connected successfully
 * Redis cache connected
 * Email service initialized
```

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend Directory

Open a new terminal window and navigate to the frontend directory:

```bash
cd last-wish-platform/frontend
```

#### 3.2 Install Node.js Dependencies

```bash
# Using npm
npm install

# Or using pnpm (recommended)
pnpm install
```

#### 3.3 Configure Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Web3 Configuration
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Application Configuration
VITE_APP_NAME=Last Wish
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_PAYMENTS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=false
```

#### 3.4 Start Frontend Development Server

```bash
# Using npm
npm run dev

# Or using pnpm
pnpm dev
```

The frontend application will start on `http://localhost:5173`. You should see output similar to:

```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Step 4: Verify Installation

#### 4.1 Test Backend API

Open your browser and navigate to:

- Health Check: `http://localhost:5000/api/health`
- API Documentation: `http://localhost:5000/api/docs` (if implemented)

You should see a JSON response indicating the API is running.

#### 4.2 Test Frontend Application

Open your browser and navigate to `http://localhost:5173`. You should see the Last Wish platform landing page with:

- Professional dark theme design
- "Connect MetaMask" button
- Platform branding and navigation

#### 4.3 Test MetaMask Integration

1. Ensure MetaMask is installed in your browser
2. Click the "Connect MetaMask" button
3. Approve the connection request
4. Verify your wallet address and balance are displayed

#### 4.4 Test Complete User Flow

1. Connect your MetaMask wallet
2. Click "Continue with This Wallet"
3. Fill out the comprehensive legal form
4. Proceed to payment ($14.20 requirement)
5. Complete payment simulation
6. Generate and download the legal document PDF

## Troubleshooting

### Common Issues and Solutions

#### Backend Issues

**Issue**: `ModuleNotFoundError: No module named 'flask'`
**Solution**: Ensure you've activated the virtual environment and installed dependencies:
```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

**Issue**: `Connection refused` for MongoDB or Redis
**Solution**: Ensure database services are running:
```bash
# Check if services are running
ps aux | grep mongod
ps aux | grep redis

# Start services if not running
mongod &
redis-server &
```

**Issue**: `ImportError: No module named 'cryptography'`
**Solution**: Install cryptography with proper dependencies:
```bash
pip install --upgrade pip
pip install cryptography
```

#### Frontend Issues

**Issue**: `Module not found` errors during npm install
**Solution**: Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Issue**: Vite dev server not starting
**Solution**: Check port availability and Node.js version:
```bash
# Check Node.js version (should be 18+)
node --version

# Try different port
npm run dev -- --port 3000
```

**Issue**: MetaMask not connecting
**Solution**: 
1. Ensure MetaMask is installed and unlocked
2. Check browser console for errors
3. Verify the site is running on HTTP (not HTTPS) for local development
4. Clear browser cache and cookies

#### Database Issues

**Issue**: MongoDB connection errors
**Solution**: 
1. Verify MongoDB is running: `mongod --version`
2. Check connection string in `.env` file
3. Ensure database permissions are correct
4. Try connecting with MongoDB Compass to verify connectivity

**Issue**: Redis connection errors
**Solution**:
1. Verify Redis is running: `redis-cli ping`
2. Check Redis URL in `.env` file
3. Ensure Redis is accepting connections on the specified port

### Performance Optimization

#### Backend Optimization

1. **Enable Caching**: Ensure Redis is properly configured for caching
2. **Database Indexing**: Create indexes for frequently queried fields
3. **Connection Pooling**: Configure MongoDB connection pooling
4. **Compression**: Enable gzip compression for API responses

#### Frontend Optimization

1. **Code Splitting**: Implement lazy loading for routes
2. **Asset Optimization**: Optimize images and static assets
3. **Bundle Analysis**: Use bundle analyzer to identify large dependencies
4. **Caching**: Implement proper browser caching strategies

### Security Considerations

#### Development Environment

1. **Environment Variables**: Never commit `.env` files to version control
2. **HTTPS**: Use HTTPS in production environments
3. **CORS**: Configure CORS properly for production domains
4. **Rate Limiting**: Test rate limiting functionality
5. **Input Validation**: Verify all form inputs are properly validated

#### Production Preparation

1. **Secret Keys**: Generate strong, unique secret keys for production
2. **Database Security**: Enable authentication for MongoDB and Redis
3. **SSL/TLS**: Configure proper SSL certificates
4. **Firewall**: Configure firewall rules for production servers
5. **Monitoring**: Implement logging and monitoring solutions


## Configuration Details

### Backend Configuration

The Flask backend uses a modular configuration system that supports different environments (development, testing, production). The main configuration file is located at `backend/src/config.py` and includes:

#### Database Configuration

The platform supports both MongoDB and PostgreSQL databases. MongoDB is recommended for its flexibility with document storage, especially for legal templates and user data. The configuration automatically detects the database type based on the connection string provided in the environment variables.

For MongoDB, the platform uses PyMongo with connection pooling and automatic reconnection handling. The database schema includes collections for users, wallets, legal documents, payments, and notifications. Each collection has proper indexing for optimal query performance.

#### Security Configuration

The security configuration implements multiple layers of protection including AES-256 encryption for sensitive data, JWT tokens for authentication, rate limiting to prevent abuse, and comprehensive input validation. The encryption service uses Fernet symmetric encryption for data at rest and bcrypt for password hashing with configurable salt rounds.

The JWT configuration supports both access and refresh tokens with configurable expiration times. The platform implements proper token rotation and blacklisting for enhanced security. Rate limiting is configured per endpoint with different limits for authentication, API calls, and file uploads.

#### Email Service Configuration

The email service supports multiple providers including SMTP, SendGrid, and AWS SES. The configuration includes template management for different types of notifications, automatic retry logic for failed deliveries, and comprehensive logging for email tracking. The service supports both HTML and plain text emails with responsive design templates.

### Frontend Configuration

The React frontend uses Vite for fast development and building. The configuration supports hot module replacement, code splitting, and automatic dependency optimization. The build process includes TypeScript checking, ESLint validation, and automatic asset optimization.

#### Web3 Integration Configuration

The Web3 integration uses the latest Web3Modal v3 with support for multiple wallet providers including MetaMask, WalletConnect, Coinbase Wallet, and hardware wallets. The configuration includes automatic network detection, chain switching, and transaction monitoring.

The wallet integration implements proper error handling for common scenarios including wallet not installed, network mismatches, insufficient funds, and transaction failures. The platform supports multiple blockchain networks including Ethereum mainnet, Polygon, Binance Smart Chain, and various testnets for development.

#### State Management Configuration

The frontend uses React Context for global state management with proper TypeScript support. The state management includes user authentication, wallet connection status, form data persistence, and notification handling. The implementation includes proper error boundaries and loading states for optimal user experience.

## Testing Guide

### Unit Testing

The platform includes comprehensive unit tests for both backend and frontend components. The backend tests use pytest with fixtures for database mocking and API endpoint testing. The frontend tests use Jest and React Testing Library for component testing and user interaction simulation.

#### Backend Testing

To run backend tests:

```bash
cd backend
python -m pytest tests/ -v
```

The test suite includes:
- API endpoint testing with different authentication levels
- Database model validation and relationship testing
- Service layer testing for business logic
- Security middleware testing for various attack scenarios
- Email service testing with mock providers
- Payment processing testing with mock gateways

#### Frontend Testing

To run frontend tests:

```bash
cd frontend
npm run test
```

The test suite includes:
- Component rendering and prop validation
- User interaction testing with wallet connections
- Form validation and submission testing
- State management testing for various scenarios
- API integration testing with mock responses
- Accessibility testing for WCAG compliance

### Integration Testing

Integration tests verify the complete user journey from wallet connection through document generation. These tests use real browser automation with Playwright to simulate actual user interactions.

To run integration tests:

```bash
npm run test:integration
```

The integration tests cover:
- Complete user registration and authentication flow
- Wallet connection with MetaMask simulation
- Form completion with various data scenarios
- Payment processing with test payment methods
- Document generation and download verification
- Email notification delivery testing

### Performance Testing

Performance tests ensure the platform can handle expected user loads and maintain response times within acceptable limits. The tests use Artillery.js for load testing and Lighthouse for frontend performance auditing.

To run performance tests:

```bash
npm run test:performance
```

Performance benchmarks:
- API response times under 200ms for 95% of requests
- Frontend page load times under 2 seconds
- Database query optimization for sub-100ms responses
- Memory usage optimization for sustained operation
- Concurrent user handling up to 1000 simultaneous connections

## API Documentation

### Authentication Endpoints

The authentication system provides secure user registration, login, and session management with JWT tokens.

#### POST /api/auth/register
Registers a new user account with email verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Smith",
  "state": "CA"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "isVerified": false
  },
  "token": "jwt_access_token"
}
```

#### POST /api/auth/login
Authenticates user credentials and returns access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "isVerified": true
  },
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

### Wallet Management Endpoints

The wallet management system handles cryptocurrency wallet connections and asset discovery.

#### POST /api/wallets/connect
Connects a cryptocurrency wallet to the user account.

**Request Body:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D4C2C2c2c2c2c2c2",
  "network": "ethereum",
  "walletType": "metamask"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet connected successfully",
  "wallet": {
    "id": "wallet_id",
    "address": "0x742d35Cc6634C0532925a3b8D4C2C2c2c2c2c2c2",
    "network": "ethereum",
    "balance": "1.2345",
    "assets": [
      {
        "symbol": "ETH",
        "balance": "1.2345",
        "value": "2469.00"
      }
    ]
  }
}
```

#### GET /api/wallets/assets/{wallet_id}
Retrieves detailed asset information for a connected wallet.

**Response:**
```json
{
  "success": true,
  "assets": [
    {
      "symbol": "ETH",
      "name": "Ethereum",
      "balance": "1.2345",
      "value": "2469.00",
      "price": "2000.00",
      "change24h": "+5.2%"
    },
    {
      "symbol": "USDC",
      "name": "USD Coin",
      "balance": "1000.00",
      "value": "1000.00",
      "price": "1.00",
      "change24h": "0.0%"
    }
  ],
  "totalValue": "3469.00"
}
```

### Document Generation Endpoints

The document generation system creates legally compliant estate planning documents.

#### POST /api/documents/generate
Generates a legal estate planning document based on user input.

**Request Body:**
```json
{
  "documentType": "will-addendum",
  "personalInfo": {
    "fullName": "John Smith",
    "dateOfBirth": "1980-01-01",
    "ssn": "1234",
    "state": "CA",
    "address": "123 Main St, Anytown, CA 90210"
  },
  "digitalAssets": {
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C2C2c2c2c2c2c2",
    "additionalAssets": "Bitcoin wallet: 1.5 BTC"
  },
  "beneficiaries": [
    {
      "name": "Jane Smith",
      "relationship": "spouse",
      "percentage": 100,
      "contact": "jane@example.com"
    }
  ],
  "executor": {
    "name": "Robert Johnson",
    "contact": "robert@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document generated successfully",
  "document": {
    "id": "doc_id",
    "type": "will-addendum",
    "status": "generated",
    "downloadUrl": "/api/documents/download/doc_id",
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

### Payment Processing Endpoints

The payment system handles both cryptocurrency and traditional payment methods.

#### POST /api/payments/create
Creates a payment intent for document generation.

**Request Body:**
```json
{
  "amount": 14.20,
  "currency": "USD",
  "paymentMethod": "crypto",
  "cryptoCurrency": "ETH"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "payment_id",
    "amount": 14.20,
    "currency": "USD",
    "cryptoAmount": "0.0071",
    "cryptoCurrency": "ETH",
    "paymentAddress": "0x1234567890123456789012345678901234567890",
    "status": "pending",
    "expiresAt": "2024-01-01T12:30:00Z"
  }
}
```

#### POST /api/payments/confirm
Confirms payment completion and processes the transaction.

**Request Body:**
```json
{
  "paymentId": "payment_id",
  "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "payment": {
    "id": "payment_id",
    "status": "completed",
    "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "confirmations": 12,
    "completedAt": "2024-01-01T12:15:00Z"
  }
}
```

## Development Workflow

### Git Workflow

The project follows a standard Git workflow with feature branches and pull requests. The main branches are:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature development
- `hotfix/*`: Critical bug fixes

### Code Standards

The project enforces code quality through automated linting and formatting:

#### Backend Standards
- Python code follows PEP 8 standards
- Type hints are required for all function signatures
- Docstrings are required for all public methods
- Unit tests are required for all new features

#### Frontend Standards
- TypeScript is used for type safety
- ESLint and Prettier enforce code formatting
- Component props must be properly typed
- Accessibility standards (WCAG 2.1) must be followed

### Continuous Integration

The project includes GitHub Actions workflows for automated testing and deployment:

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          python -m pytest tests/ -v

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      - name: Run tests
        run: |
          cd frontend
          npm run test
```

### Database Migrations

The platform includes a migration system for database schema changes:

```bash
# Create new migration
python manage.py create_migration "add_user_preferences"

# Run migrations
python manage.py migrate

# Rollback migration
python manage.py rollback
```

### Monitoring and Logging

The platform includes comprehensive monitoring and logging:

#### Backend Logging
- Structured logging with JSON format
- Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Request/response logging for API endpoints
- Error tracking with stack traces
- Performance metrics logging

#### Frontend Monitoring
- Error boundary implementation
- User interaction tracking
- Performance monitoring with Web Vitals
- Console error tracking
- Network request monitoring

### Backup and Recovery

The platform includes automated backup procedures:

#### Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/lastwish" --out=/backup/$(date +%Y%m%d)

# Automated daily backup script
#!/bin/bash
BACKUP_DIR="/backup/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR
mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR
tar -czf "$BACKUP_DIR.tar.gz" $BACKUP_DIR
rm -rf $BACKUP_DIR
```

#### File Backup
```bash
# User uploaded files backup
rsync -av /app/uploads/ /backup/uploads/$(date +%Y%m%d)/
```

This comprehensive local setup guide provides everything needed to run the Last Wish platform in a development environment. The platform is designed to be modular and scalable, making it easy to extend with additional features or integrate with external services.

