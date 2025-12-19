# EcoDePIN - Web3 DePIN Investment Platform

## Original Problem Statement
Create a React wrapper dApp with Web3 Blockchain-based DePIN for RWAs such as:
- Data centers
- Battery energy storage assets
- EV fast charging stations
- Renewable energy plants
- Green credit projects

### Features Required:
1. Landing page and introduction of features and the Web3 Blockchain (Solana-based)
2. Separate segment introduction pages with investment plans and DePIN integration
3. User login console, wallet, payment integration, and profile with authentication

### User Choices:
- Multiple wallet support (Phantom, Solflare)
- Both Stripe + Crypto payments
- Emergent-managed Google OAuth
- Advanced investment plans (APY, min investment, lock period + projected returns calculator, risk metrics)
- Clean modern with green accents (eco-friendly focus)

---

## Architecture Completed

### Backend (FastAPI)
- `/api/segments` - Get all 5 investment segments
- `/api/segments/{id}` - Get individual segment details
- `/api/plans` - Get all 15 investment plans (3 per segment)
- `/api/plans?segment_id=X` - Filter plans by segment
- `/api/calculator` - Calculate projected returns
- `/api/auth/session` - Emergent OAuth session exchange
- `/api/auth/me` - Get current user
- `/api/auth/logout` - User logout
- `/api/auth/connect-wallet` - Link wallet to profile
- `/api/investments` - User investments CRUD
- `/api/portfolio/stats` - Portfolio and impact metrics
- `/api/payments/checkout` - Stripe checkout session
- `/api/payments/status/{id}` - Payment status polling
- `/api/webhook/stripe` - Stripe webhook handler

### Frontend (React + shadcn/ui)
- **Landing Page** - Hero, features grid, segments carousel, how it works, CTAs
- **Segments Page** - All segments with search and filtering
- **Segment Detail Page** - Overview, plans tab, sustainability tab, investment calculator
- **Dashboard** - Portfolio value, investments, impact metrics (protected)
- **Profile** - User info, wallet connection, logout (protected)
- **Payment Pages** - Success/cancel handlers with status polling

### Database (MongoDB)
- `users` - User profiles with wallet addresses
- `user_sessions` - Auth session tokens
- `investments` - User investments
- `payment_transactions` - Stripe payment records

### Integrations
- **Emergent Google OAuth** - Social login authentication
- **Solana Wallets** - Phantom and Solflare support
- **Stripe Payments** - Fiat payment processing

---

## Next Action Items

### Phase 2 - Enhanced Features
1. **Crypto Payments** - Implement direct SOL/USDC payments via wallet
2. **Smart Contract Integration** - Deploy Solana programs for tokenized investments
3. **Real-time Updates** - WebSocket for live portfolio updates
4. **Rewards Claiming** - UI for claiming accumulated rewards
5. **Transaction History** - Full payment and investment history page

### Phase 3 - Advanced
1. **Admin Dashboard** - Manage segments, plans, and users
2. **KYC Integration** - For regulatory compliance
3. **Email Notifications** - Investment confirmations, reward alerts
4. **Mobile Optimization** - PWA support
5. **Analytics Dashboard** - Investment trends and performance charts

---

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, shadcn/ui, Solana Wallet Adapter
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic
- **Database**: MongoDB
- **Auth**: Emergent OAuth (Google)
- **Payments**: Stripe via emergentintegrations
- **Blockchain**: Solana (Phantom, Solflare wallets)
