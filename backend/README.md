# EcoDePIN Backend

## Node.js Backend Structure (Reference Implementation)

The `/app/backend/src/` folder contains a complete Node.js + Express.js backend implementation that can replace the Python FastAPI backend when deployed outside of the Emergent environment.

### Project Structure

```
backend/
│
├── src/
│   ├── config/
│   │   ├── db.js                # MongoDB connection via Mongoose
│   │   └── env.js               # Environment variable loader
│   │
│   ├── controllers/
│   │   ├── auth.controller.js   # Emergent OAuth authentication
│   │   ├── wallet.controller.js # EVM wallet connection
│   │   ├── segments.controller.js # Investment segments & plans
│   │   ├── investment.controller.js # User investments
│   │   └── payment.controller.js # Stripe payments
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js   # Session token validation
│   │   └── error.middleware.js  # Global error handling
│   │
│   ├── models/
│   │   ├── user.model.js        # User schema
│   │   ├── session.model.js     # Auth sessions
│   │   ├── investment.model.js  # Investments
│   │   ├── payment.model.js     # Payment transactions
│   │   └── index.js             # Model exports
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── wallet.routes.js
│   │   ├── segments.routes.js
│   │   ├── investment.routes.js
│   │   ├── payment.routes.js
│   │   ├── portfolio.routes.js
│   │   └── index.js             # Route aggregator
│   │
│   ├── constants/
│   │   ├── walletTypes.js       # EVM wallet configurations
│   │   └── roles.js             # User roles
│   │
│   ├── utils/
│   │   ├── logger.js            # Logging utility
│   │   └── response.js          # Standardized API responses
│   │
│   ├── app.js                   # Express app setup
│   └── server.js                # Entry point
│
├── .env                         # Environment variables
├── package.json                 # Dependencies
└── README.md
```

### Running Node.js Backend Locally

```bash
cd /app/backend
npm install
npm run dev
```

### Environment Variables

```env
PORT=8001
NODE_ENV=development

# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database

# CORS
CORS_ORIGINS=*

# JWT
JWT_SECRET=your_jwt_secret

# Stripe
STRIPE_API_KEY=sk_test_xxx

# EVM Wallets
METAMASK_ENABLED=true
TRUST_WALLET_ENABLED=true
WALLETCONNECT_ENABLED=true
WALLETCONNECT_PROJECT_ID=your_project_id
SUPPORTED_CHAIN_IDS=1,137,56,42161
```

### API Endpoints

#### Authentication
- `POST /api/auth/session` - Exchange Emergent OAuth session for app session
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

#### Wallet
- `GET /api/wallet/supported` - Get supported EVM wallets
- `POST /api/wallet/connect` - Connect wallet to profile
- `POST /api/wallet/disconnect` - Disconnect wallet
- `POST /api/wallet/switch-chain` - Switch chain

#### Segments & Plans
- `GET /api/segments` - Get all segments
- `GET /api/segments/:id` - Get segment by ID
- `GET /api/plans` - Get all plans (optional ?segment_id filter)
- `GET /api/plans/:id` - Get plan by ID
- `POST /api/calculator` - Calculate investment returns

#### Investments
- `GET /api/investments` - Get user investments
- `POST /api/investments` - Create investment
- `GET /api/portfolio/stats` - Get portfolio statistics

#### Payments
- `POST /api/payments/checkout` - Create Stripe checkout
- `GET /api/payments/status/:id` - Get payment status
- `GET /api/payments/history` - Get payment history

---

## Current Implementation (Python FastAPI)

The current running backend uses Python FastAPI (`server.py`) due to Emergent platform requirements. It provides identical functionality with the same API endpoints.

### Supported EVM Wallets
- MetaMask
- Trust Wallet
- WalletConnect
- Coinbase Wallet

### Supported Chains
- Ethereum Mainnet (1)
- Polygon (137)
- BNB Smart Chain (56)
- Arbitrum One (42161)
