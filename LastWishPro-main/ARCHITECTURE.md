# Last Wish Platform - Architecture Documentation

## Overview

The Last Wish platform is a production-ready web application for creating notarizable cryptocurrency estate planning addendums. The platform follows a modern full-stack architecture with React frontend, Flask backend, and multiple database systems for different data types.

## System Architecture

### Frontend (React)
- **Framework**: React 19.1.0 with Vite build system
- **Styling**: Tailwind CSS 4.1.7 with shadcn/ui components
- **Routing**: React Router DOM 7.6.1
- **State Management**: React hooks and context
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Lucide React
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion

### Backend (Flask)
- **Framework**: Flask 3.1.1 with SQLAlchemy ORM
- **Database**: 
  - PostgreSQL for persistent user data, payments, notifications
  - MongoDB for temporary session data (wallet connections, assets)
  - SQLite for development (will be replaced with PostgreSQL)
- **Authentication**: JWT tokens with secure session management
- **File Storage**: AWS S3 for PDF documents
- **Email**: SendGrid/AWS SES for notifications
- **Encryption**: AES-256 for data at rest, TLS 1.3 for transit

### External Integrations

#### Blockchain APIs
- **Ethereum**: Etherscan API for asset data
- **Solana**: Solscan API for asset data  
- **Bitcoin**: Blockstream API for asset data
- **Wallet Connection**: WalletConnect v2 for secure wallet integration

#### Payment Processing
- **Primary**: CoinPayments API for cryptocurrency payments
- **Fallback**: BitPay API
- **Price Data**: CoinGecko API for real-time USD conversion

#### Cloud Services
- **Storage**: AWS S3 for PDF documents and backups
- **Email**: SendGrid for transactional emails
- **Monitoring**: Sentry for error tracking
- **Deployment**: Vercel for frontend, AWS/Railway for backend

## Data Models

### User Management
```sql
-- Users table (PostgreSQL)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    date_of_birth DATE,
    executor_name VARCHAR(200),
    executor_email VARCHAR(255),
    digital_executor_name VARCHAR(200),
    digital_executor_email VARCHAR(255),
    two_fa_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions (PostgreSQL)
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Wallet and Asset Data
```javascript
// MongoDB collections for temporary session data
{
  // wallet_sessions collection
  _id: ObjectId,
  userId: String,
  walletAddress: String,
  blockchain: String, // 'ethereum', 'solana', 'bitcoin'
  connectedAt: Date,
  lastSyncAt: Date,
  assets: [
    {
      symbol: String,
      name: String,
      balance: String,
      valueUsd: Number,
      contractAddress: String,
      tokenType: String // 'native', 'erc20', 'nft', etc.
    }
  ],
  beneficiaries: [
    {
      assetId: String,
      name: String,
      email: String,
      relationship: String,
      percentage: Number
    }
  ]
}
```

### Payment and Subscription Data
```sql
-- Payments table (PostgreSQL)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    plan_type VARCHAR(50), -- 'basic', 'premium', 'enterprise'
    amount_usd DECIMAL(10,2),
    amount_crypto DECIMAL(20,8),
    cryptocurrency VARCHAR(10),
    payment_address VARCHAR(255),
    transaction_hash VARCHAR(255),
    status VARCHAR(20), -- 'pending', 'confirmed', 'failed', 'refunded'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);

-- Subscription plans
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE,
    price_usd DECIMAL(10,2),
    max_wallets INTEGER,
    max_beneficiaries INTEGER,
    features JSONB,
    active BOOLEAN DEFAULT TRUE
);
```

### Document and Legal Data
```sql
-- Generated addendums (PostgreSQL)
CREATE TABLE addendums (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255),
    content JSONB, -- Structured addendum data
    pdf_s3_key VARCHAR(255),
    status VARCHAR(20), -- 'draft', 'generated', 'notarized'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification preferences and logs
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50), -- 'email', 'sms'
    event VARCHAR(100), -- 'payment_confirmed', 'addendum_created', etc.
    recipient VARCHAR(255),
    content TEXT,
    sent_at TIMESTAMP,
    status VARCHAR(20) -- 'sent', 'failed', 'pending'
);
```

## Security Architecture

### Data Protection
- **Encryption at Rest**: AES-256 encryption for sensitive user data
- **Encryption in Transit**: TLS 1.3 for all API communications
- **Sensitive Data Exclusion**: No storage of private keys, seed phrases, or passwords
- **Input Validation**: Regex-based blocking of sensitive data in forms
- **Session Security**: JWT tokens with short expiration and refresh mechanism

### Access Control
- **Authentication**: Multi-factor authentication with email/SMS
- **Authorization**: Role-based access control for different user types
- **API Security**: Rate limiting, CORS configuration, input sanitization
- **Database Security**: Parameterized queries, connection encryption

### Compliance
- **GDPR**: User consent management, data portability, right to deletion
- **CCPA**: Privacy policy compliance, opt-out mechanisms
- **RUFADAA**: Fiduciary access provisions for digital assets

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/verify-2fa` - Two-factor authentication

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/enable-2fa` - Enable two-factor auth
- `DELETE /api/users/account` - Delete user account

### Wallet Integration
- `POST /api/wallets/connect` - Connect wallet session
- `GET /api/wallets/assets` - Get wallet assets
- `POST /api/wallets/sync` - Sync wallet data
- `DELETE /api/wallets/disconnect` - Disconnect wallet

### Addendum Management
- `POST /api/addendums/create` - Create new addendum
- `GET /api/addendums/:id` - Get addendum details
- `PUT /api/addendums/:id` - Update addendum
- `POST /api/addendums/:id/generate-pdf` - Generate PDF
- `GET /api/addendums/:id/download` - Download PDF

### Payment Processing
- `GET /api/payments/plans` - Get subscription plans
- `POST /api/payments/create` - Create payment
- `GET /api/payments/status/:id` - Check payment status
- `POST /api/payments/webhook` - Payment webhook

### Legal and Compliance
- `GET /api/legal/faq` - Get FAQ content
- `GET /api/legal/templates` - Get legal templates
- `GET /api/legal/notarization-guide` - Get notarization guide

## Deployment Architecture

### Development Environment
- Frontend: Vite dev server on port 5173
- Backend: Flask dev server on port 5000
- Database: Local SQLite for development

### Production Environment
- Frontend: Deployed on Vercel with CDN
- Backend: Deployed on AWS/Railway with auto-scaling
- Database: PostgreSQL on AWS RDS, MongoDB Atlas
- Storage: AWS S3 for PDFs and static assets
- Monitoring: Sentry for error tracking, CloudWatch for metrics

### CI/CD Pipeline
- Source Control: Git with feature branch workflow
- Testing: Automated tests on pull requests
- Deployment: Automatic deployment on main branch merge
- Monitoring: Real-time error tracking and performance monitoring

## Performance Considerations

### Frontend Optimization
- Code splitting and lazy loading for 2-second page loads
- Image optimization and compression
- Caching strategies for static assets
- Progressive Web App features

### Backend Optimization
- Database query optimization and indexing
- API response caching
- Connection pooling for database connections
- Async processing for heavy operations

### Scalability
- Horizontal scaling for backend services
- Database read replicas for improved performance
- CDN for global content delivery
- Load balancing for high availability

## Monitoring and Analytics

### Error Tracking
- Sentry integration for real-time error monitoring
- Custom error boundaries in React components
- Structured logging for backend services

### Performance Monitoring
- Core Web Vitals tracking
- API response time monitoring
- Database query performance analysis
- User experience metrics

### Business Analytics
- User registration and engagement metrics
- Payment conversion tracking
- Feature usage analytics
- Customer support metrics

This architecture ensures a secure, scalable, and maintainable platform that meets all the requirements specified in the PRD while providing a solid foundation for future enhancements.

