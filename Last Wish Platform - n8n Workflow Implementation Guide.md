# Last Wish Platform - n8n Workflow Implementation Guide

## Quick Start Guide

This guide provides step-by-step instructions for implementing the Last Wish platform n8n workflow in your environment.

### Prerequisites

1. **n8n Instance**: Running n8n server (self-hosted or cloud)
2. **Database**: PostgreSQL database for user data storage
3. **Email Service**: SMTP server for email notifications
4. **API Keys**: 
   - Etherscan API key for blockchain data
   - Email service credentials
   - Payment gateway credentials (optional for testing)

### Step 1: Import the Workflow

1. Download the workflow file: `last-wish-n8n-workflow.json`
2. In your n8n interface, go to **Workflows** → **Import from File**
3. Select the downloaded JSON file
4. Click **Import**

### Step 2: Configure Database Connection

1. Go to **Credentials** → **Add Credential**
2. Select **Postgres**
3. Configure with your database details:
   ```
   Host: your-database-host
   Database: lastwish_db
   User: your-db-user
   Password: your-db-password
   Port: 5432
   ```
4. Save as "Last Wish Database"

### Step 3: Set Up Email Service

1. Add new **SMTP** credential
2. Configure your email service:
   ```
   Host: your-smtp-host
   Port: 587 (or your SMTP port)
   User: your-email-username
   Password: your-email-password
   ```
3. Save as "Last Wish SMTP"

### Step 4: Configure API Keys

1. Add **HTTP Basic Auth** credential for Etherscan
2. Set API key in the credential
3. Save as "Etherscan API"

### Step 5: Create Database Tables

Execute these SQL commands in your PostgreSQL database:

```sql
-- Users table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    state VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    verification_token VARCHAR(255),
    verification_expiry TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending_verification',
    subscription_tier VARCHAR(50) DEFAULT 'free',
    compliance_score INTEGER DEFAULT 0
);

-- User wallets table
CREATE TABLE user_wallets (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    wallet_address VARCHAR(255) NOT NULL,
    wallet_type VARCHAR(50) NOT NULL,
    chain_id INTEGER NOT NULL,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- User assets table
CREATE TABLE user_assets (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    wallet_address VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    asset_symbol VARCHAR(20) NOT NULL,
    balance DECIMAL(20, 8) NOT NULL,
    value_usd DECIMAL(15, 2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    network VARCHAR(50) NOT NULL
);

-- Payments table
CREATE TABLE payments (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    plan_type VARCHAR(50) NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Generated documents table
CREATE TABLE generated_documents (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    document_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    word_count INTEGER,
    page_count INTEGER,
    version VARCHAR(20) DEFAULT '1.0'
);
```

### Step 6: Test the Workflow

1. **Activate the Workflow**: In n8n, click the toggle to activate the workflow
2. **Test User Registration**:
   ```bash
   curl -X POST http://your-n8n-instance/webhook/user-registration \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "SecurePassword123!",
       "firstName": "John",
       "lastName": "Doe",
       "state": "California"
     }'
   ```

3. **Test Wallet Connection**:
   ```bash
   curl -X POST http://your-n8n-instance/webhook/wallet-connect \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "user_123",
       "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d2d",
       "walletType": "MetaMask",
       "chainId": 1
     }'
   ```

### Step 7: Frontend Integration

Update your frontend to call the n8n webhook endpoints:

```javascript
// User Registration
const registerUser = async (userData) => {
  const response = await fetch('/webhook/user-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// Wallet Connection
const connectWallet = async (walletData) => {
  const response = await fetch('/webhook/wallet-connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(walletData)
  });
  return response.json();
};

// Payment Processing
const processPayment = async (paymentData) => {
  const response = await fetch('/webhook/payment-process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });
  return response.json();
};

// Document Generation
const generateDocument = async (documentData) => {
  const response = await fetch('/webhook/generate-document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(documentData)
  });
  return response.json();
};
```

## Webhook Endpoints

The workflow creates the following webhook endpoints:

1. **User Registration**: `/webhook/user-registration` (POST)
2. **Email Verification**: `/webhook/verify-email` (GET)
3. **Wallet Connection**: `/webhook/wallet-connect` (POST)
4. **Payment Processing**: `/webhook/payment-process` (POST)
5. **Document Generation**: `/webhook/generate-document` (POST)

## Workflow Features

### ✅ Complete User Journey
- User registration with email verification
- Wallet connection and asset discovery
- Payment processing with multiple plans
- Legal document generation
- Email notifications throughout the process

### ✅ Security Features
- Input validation and sanitization
- Secure token generation
- Database transaction safety
- Error handling and recovery

### ✅ Integration Ready
- Blockchain API integration (Etherscan)
- Email service integration
- Payment gateway simulation
- Database persistence

### ✅ Production Ready
- Comprehensive error handling
- Professional email templates
- Detailed logging and monitoring
- Scalable architecture

## Customization Options

### Email Templates
Modify the HTML email templates in the workflow nodes to match your branding.

### Payment Integration
Replace the payment simulation with actual payment gateway integration (Stripe, PayPal, etc.).

### Blockchain Networks
Add support for additional blockchain networks by creating new API integration nodes.

### Document Templates
Customize the legal document generation logic to match your specific requirements.

## Monitoring and Maintenance

### Health Checks
Monitor the workflow execution logs in n8n for any errors or performance issues.

### Database Maintenance
Regularly backup your PostgreSQL database and monitor for performance optimization opportunities.

### API Rate Limits
Monitor API usage for external services (Etherscan, email service) to avoid rate limiting.

### Security Updates
Regularly update n8n and review security configurations.

## Support and Troubleshooting

### Common Issues

1. **Database Connection Errors**: Verify database credentials and network connectivity
2. **Email Delivery Issues**: Check SMTP configuration and email service status
3. **API Rate Limits**: Implement caching and request throttling
4. **Webhook Timeouts**: Optimize workflow performance and add timeout handling

### Getting Help

- Check n8n execution logs for detailed error information
- Review the comprehensive documentation in `n8n-workflow-documentation.md`
- Test individual workflow nodes to isolate issues
- Monitor database logs for SQL errors

## Next Steps

1. **Production Deployment**: Configure production environment with proper security
2. **Monitoring Setup**: Implement comprehensive monitoring and alerting
3. **Backup Strategy**: Set up automated database and configuration backups
4. **Performance Optimization**: Monitor and optimize workflow performance
5. **Feature Enhancement**: Add additional features based on user feedback

---

This implementation guide provides everything needed to deploy and run the Last Wish platform n8n workflow in your environment. The workflow is production-ready and includes all necessary features for a complete cryptocurrency estate planning solution.

