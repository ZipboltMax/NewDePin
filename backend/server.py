from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="EcoDePIN API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============= MODELS =============

class User(BaseModel):
    user_id: str = Field(default_factory=lambda: f"user_{uuid.uuid4().hex[:12]}")
    email: str
    name: str
    picture: Optional[str] = None
    wallet_address: Optional[str] = None
    wallet_type: Optional[str] = None
    chain_id: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    session_id: str = Field(default_factory=lambda: f"sess_{uuid.uuid4().hex}")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InvestmentSegment(BaseModel):
    segment_id: str
    name: str
    description: str
    short_description: str
    image_url: str
    icon: str
    features: List[str]
    total_tvl: float
    investors_count: int

class InvestmentPlan(BaseModel):
    plan_id: str
    segment_id: str
    name: str
    min_investment: float
    max_investment: float
    apy: float
    lock_period_days: int
    risk_level: str  # Low, Medium, High
    description: str
    features: List[str]

class Investment(BaseModel):
    investment_id: str = Field(default_factory=lambda: f"inv_{uuid.uuid4().hex[:12]}")
    user_id: str
    plan_id: str
    segment_id: str
    amount: float
    apy: float
    lock_period_days: int
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_date: datetime
    status: str = "active"  # active, completed, withdrawn
    rewards_earned: float = 0.0

class PaymentTransaction(BaseModel):
    transaction_id: str = Field(default_factory=lambda: f"txn_{uuid.uuid4().hex[:12]}")
    user_id: str
    amount: float
    currency: str = "usd"
    payment_method: str  # stripe, crypto
    session_id: Optional[str] = None
    status: str = "pending"  # pending, completed, failed, expired
    metadata: Dict = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============= SEGMENT DATA =============

SEGMENTS = [
    {
        "segment_id": "data-centers",
        "name": "Data Centers",
        "description": "Invest in sustainable, energy-efficient data centers powering the digital economy. Our data center assets utilize renewable energy sources and advanced cooling technologies to minimize environmental impact while maximizing returns.",
        "short_description": "Power the cloud sustainably",
        "image_url": "https://images.unsplash.com/photo-1733187633171-3b1c0c6ce708?crop=entropy&cs=srgb&fm=jpg&q=85",
        "icon": "Server",
        "features": ["100% Renewable Energy", "PUE < 1.2", "Tier 4 Certified", "Edge Computing Ready"],
        "total_tvl": 45000000,
        "investors_count": 2847
    },
    {
        "segment_id": "battery-storage",
        "name": "Battery Energy Storage",
        "description": "Support grid-scale battery storage systems that store renewable energy and stabilize power grids. These assets play a critical role in the transition to clean energy by enabling 24/7 renewable power.",
        "short_description": "Store energy, power futures",
        "image_url": "https://images.unsplash.com/photo-1715605569694-4cc47c9fb535?crop=entropy&cs=srgb&fm=jpg&q=85",
        "icon": "Battery",
        "features": ["Grid Stabilization", "Peak Shaving", "Frequency Regulation", "Backup Power"],
        "total_tvl": 32000000,
        "investors_count": 1923
    },
    {
        "segment_id": "ev-charging",
        "name": "EV Fast Charging",
        "description": "Accelerate the electric vehicle revolution by investing in fast-charging infrastructure. Our network of charging stations supports the growing EV market while generating consistent returns.",
        "short_description": "Charge the future",
        "image_url": "https://images.unsplash.com/photo-1765272088009-100c96a4cd4e?crop=entropy&cs=srgb&fm=jpg&q=85",
        "icon": "Zap",
        "features": ["350kW Ultra-Fast", "Strategic Locations", "Smart Grid Integration", "24/7 Availability"],
        "total_tvl": 28000000,
        "investors_count": 3421
    },
    {
        "segment_id": "renewable-energy",
        "name": "Renewable Energy Plants",
        "description": "Invest directly in solar farms, wind parks, and hydroelectric facilities. These assets generate clean energy while providing stable, long-term returns backed by power purchase agreements.",
        "short_description": "Harvest nature's power",
        "image_url": "https://images.unsplash.com/photo-1755585129999-7b29cf3baebe?crop=entropy&cs=srgb&fm=jpg&q=85",
        "icon": "Sun",
        "features": ["20+ Year PPAs", "Carbon Neutral", "Government Incentives", "Diversified Portfolio"],
        "total_tvl": 67000000,
        "investors_count": 4156
    },
    {
        "segment_id": "green-credits",
        "name": "Green Credit Projects",
        "description": "Participate in carbon credit and environmental offset projects. Support reforestation, conservation, and emissions reduction initiatives while earning returns from the growing carbon market.",
        "short_description": "Offset, earn, impact",
        "image_url": "https://images.unsplash.com/photo-1683444595829-e74e68fcce22?crop=entropy&cs=srgb&fm=jpg&q=85",
        "icon": "Leaf",
        "features": ["Verified Credits", "Biodiversity Projects", "Corporate Partnerships", "Transparent Tracking"],
        "total_tvl": 18000000,
        "investors_count": 1287
    }
]

INVESTMENT_PLANS = [
    # Data Centers Plans
    {"plan_id": "dc-starter", "segment_id": "data-centers", "name": "Starter Node", "min_investment": 100, "max_investment": 5000, "apy": 8.5, "lock_period_days": 30, "risk_level": "Low", "description": "Entry-level investment in data center operations", "features": ["Daily rewards", "Flexible withdrawal", "Basic analytics"]},
    {"plan_id": "dc-growth", "segment_id": "data-centers", "name": "Growth Cluster", "min_investment": 5000, "max_investment": 25000, "apy": 12.0, "lock_period_days": 90, "risk_level": "Medium", "description": "Medium-term investment with enhanced returns", "features": ["Higher APY", "Priority support", "Advanced metrics"]},
    {"plan_id": "dc-enterprise", "segment_id": "data-centers", "name": "Enterprise Rack", "min_investment": 25000, "max_investment": 100000, "apy": 15.5, "lock_period_days": 180, "risk_level": "Medium", "description": "Premium investment tier with maximum benefits", "features": ["Highest APY", "Direct asset ownership", "VIP access"]},
    
    # Battery Storage Plans
    {"plan_id": "bs-basic", "segment_id": "battery-storage", "name": "Cell Pack", "min_investment": 250, "max_investment": 10000, "apy": 9.0, "lock_period_days": 30, "risk_level": "Low", "description": "Start your journey in energy storage", "features": ["Stable returns", "Weekly payouts", "Low risk"]},
    {"plan_id": "bs-module", "segment_id": "battery-storage", "name": "Module Array", "min_investment": 10000, "max_investment": 50000, "apy": 13.5, "lock_period_days": 120, "risk_level": "Medium", "description": "Scale your energy storage investment", "features": ["Enhanced APY", "Grid revenue share", "Quarterly bonuses"]},
    {"plan_id": "bs-grid", "segment_id": "battery-storage", "name": "Grid Station", "min_investment": 50000, "max_investment": 200000, "apy": 18.0, "lock_period_days": 365, "risk_level": "High", "description": "Institutional-grade storage investment", "features": ["Maximum returns", "Asset tokenization", "Governance rights"]},
    
    # EV Charging Plans
    {"plan_id": "ev-charger", "segment_id": "ev-charging", "name": "Single Charger", "min_investment": 150, "max_investment": 7500, "apy": 10.0, "lock_period_days": 30, "risk_level": "Low", "description": "Own a stake in EV charging infrastructure", "features": ["Usage-based rewards", "Real-time metrics", "Network access"]},
    {"plan_id": "ev-station", "segment_id": "ev-charging", "name": "Charging Station", "min_investment": 7500, "max_investment": 35000, "apy": 14.0, "lock_period_days": 90, "risk_level": "Medium", "description": "Multi-charger station investment", "features": ["Higher throughput", "Premium locations", "Fleet partnerships"]},
    {"plan_id": "ev-hub", "segment_id": "ev-charging", "name": "Charging Hub", "min_investment": 35000, "max_investment": 150000, "apy": 17.5, "lock_period_days": 180, "risk_level": "Medium", "description": "Major hub infrastructure ownership", "features": ["Hub operator rewards", "Commercial contracts", "Expansion rights"]},
    
    # Renewable Energy Plans
    {"plan_id": "re-panel", "segment_id": "renewable-energy", "name": "Solar Panel", "min_investment": 200, "max_investment": 10000, "apy": 7.5, "lock_period_days": 60, "risk_level": "Low", "description": "Entry into solar energy investment", "features": ["Guaranteed PPAs", "Weather insurance", "Stable income"]},
    {"plan_id": "re-array", "segment_id": "renewable-energy", "name": "Solar Array", "min_investment": 10000, "max_investment": 50000, "apy": 11.0, "lock_period_days": 180, "risk_level": "Low", "description": "Large-scale solar investment", "features": ["Utility contracts", "Tax benefits", "Long-term security"]},
    {"plan_id": "re-farm", "segment_id": "renewable-energy", "name": "Energy Farm", "min_investment": 50000, "max_investment": 500000, "apy": 14.5, "lock_period_days": 365, "risk_level": "Medium", "description": "Full renewable energy farm ownership", "features": ["Diversified sources", "Government subsidies", "Legacy investment"]},
    
    # Green Credits Plans
    {"plan_id": "gc-offset", "segment_id": "green-credits", "name": "Carbon Offset", "min_investment": 100, "max_investment": 5000, "apy": 6.0, "lock_period_days": 30, "risk_level": "Low", "description": "Support carbon reduction projects", "features": ["Verified credits", "Impact certificates", "Portfolio offset"]},
    {"plan_id": "gc-forest", "segment_id": "green-credits", "name": "Forest Reserve", "min_investment": 5000, "max_investment": 25000, "apy": 9.5, "lock_period_days": 180, "risk_level": "Medium", "description": "Invest in reforestation projects", "features": ["Biodiversity bonus", "Carbon sequestration", "Land appreciation"]},
    {"plan_id": "gc-impact", "segment_id": "green-credits", "name": "Impact Fund", "min_investment": 25000, "max_investment": 100000, "apy": 12.0, "lock_period_days": 365, "risk_level": "Medium", "description": "Diversified environmental impact portfolio", "features": ["Multi-project exposure", "ESG compliance", "Corporate credits"]}
]

# ============= AUTH HELPERS =============

async def get_user_from_session(request: Request) -> Optional[dict]:
    """Extract user from session token in cookie or header"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        return None
    
    # Check expiry with timezone awareness
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    return user_doc

async def require_auth(request: Request) -> dict:
    """Dependency that requires authentication"""
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# ============= AUTH ROUTES =============

@api_router.post("/auth/session")
async def create_session(request: Request):
    """Exchange session_id from Emergent Auth for session token"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth to get user data
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session_id")
            user_data = response.json()
        except Exception as e:
            logger.error(f"Auth error: {e}")
            raise HTTPException(status_code=500, detail="Authentication service error")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user data if needed
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": user_data["name"], "picture": user_data.get("picture")}}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = {
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "wallet_address": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(new_user)
    
    # Create session
    session_token = f"sess_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session_doc = {
        "session_id": f"sess_{uuid.uuid4().hex[:8]}",
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Get full user data
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    response = JSONResponse(content={"user": user_doc, "session_token": session_token})
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    return response

@api_router.get("/auth/me")
async def get_current_user(user: dict = Depends(require_auth)):
    """Get current authenticated user"""
    return user

@api_router.post("/auth/logout")
async def logout(request: Request):
    """Logout and clear session"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie(key="session_token", path="/")
    return response

@api_router.post("/auth/connect-wallet")
async def connect_wallet(request: Request, user: dict = Depends(require_auth)):
    """Connect wallet address to user profile"""
    body = await request.json()
    wallet_address = body.get("wallet_address")
    wallet_type = body.get("wallet_type", "metamask")
    chain_id = body.get("chain_id", 1)
    
    if not wallet_address:
        raise HTTPException(status_code=400, detail="wallet_address required")
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {
            "wallet_address": wallet_address.lower(),
            "wallet_type": wallet_type,
            "chain_id": chain_id
        }}
    )
    
    updated_user = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return updated_user

# ============= WALLET ROUTES =============

SUPPORTED_WALLETS = [
    {"type": "metamask", "name": "MetaMask", "icon": "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg", "enabled": True},
    {"type": "trust_wallet", "name": "Trust Wallet", "icon": "https://trustwallet.com/assets/images/media/assets/TWT.svg", "enabled": True},
    {"type": "walletconnect", "name": "WalletConnect", "icon": "https://walletconnect.com/walletconnect-logo.png", "enabled": True},
    {"type": "coinbase", "name": "Coinbase Wallet", "icon": "https://www.coinbase.com/img/favicon/favicon-256.png", "enabled": True},
]

SUPPORTED_CHAINS = [
    {"chainId": 137, "name": "Polygon Mainnet"},
]

POLYGON_CHAIN_ID = 137

@api_router.get("/wallet/supported")
async def get_supported_wallets():
    """Get list of supported EVM wallets"""
    return {"success": True, "data": {"wallets": SUPPORTED_WALLETS, "chains": SUPPORTED_CHAINS}}

@api_router.post("/wallet/connect")
async def connect_wallet_new(request: Request, user: dict = Depends(require_auth)):
    """Connect EVM wallet to user profile"""
    body = await request.json()
    wallet_address = body.get("wallet_address")
    wallet_type = body.get("wallet_type", "metamask")
    chain_id = body.get("chain_id", 1)
    
    if not wallet_address:
        raise HTTPException(status_code=400, detail="wallet_address required")
    
    # Validate EVM address format
    if not wallet_address.startswith("0x") or len(wallet_address) != 42:
        raise HTTPException(status_code=400, detail="Invalid EVM wallet address format")
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {
            "wallet_address": wallet_address.lower(),
            "wallet_type": wallet_type,
            "chain_id": chain_id
        }}
    )
    
    updated_user = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return {"success": True, "data": updated_user}

@api_router.post("/wallet/disconnect")
async def disconnect_wallet(request: Request, user: dict = Depends(require_auth)):
    """Disconnect wallet from user profile"""
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"wallet_address": None, "wallet_type": None, "chain_id": None}}
    )
    updated_user = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return {"success": True, "data": updated_user}

# ============= SEGMENTS & PLANS ROUTES =============

@api_router.get("/segments", response_model=List[dict])
async def get_segments():
    """Get all investment segments"""
    return SEGMENTS

@api_router.get("/segments/{segment_id}")
async def get_segment(segment_id: str):
    """Get single segment by ID"""
    segment = next((s for s in SEGMENTS if s["segment_id"] == segment_id), None)
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")
    return segment

@api_router.get("/plans")
async def get_all_plans(segment_id: Optional[str] = None):
    """Get investment plans, optionally filtered by segment"""
    if segment_id:
        return [p for p in INVESTMENT_PLANS if p["segment_id"] == segment_id]
    return INVESTMENT_PLANS

@api_router.get("/plans/{plan_id}")
async def get_plan(plan_id: str):
    """Get single plan by ID"""
    plan = next((p for p in INVESTMENT_PLANS if p["plan_id"] == plan_id), None)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

# ============= INVESTMENT ROUTES =============

@api_router.get("/investments")
async def get_user_investments(user: dict = Depends(require_auth)):
    """Get all investments for current user"""
    investments = await db.investments.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    return investments

@api_router.post("/investments")
async def create_investment(request: Request, user: dict = Depends(require_auth)):
    """Create a new investment after successful payment"""
    body = await request.json()
    plan_id = body.get("plan_id")
    amount = body.get("amount")
    payment_transaction_id = body.get("payment_transaction_id")
    
    # Validate plan
    plan = next((p for p in INVESTMENT_PLANS if p["plan_id"] == plan_id), None)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    if amount < plan["min_investment"] or amount > plan["max_investment"]:
        raise HTTPException(status_code=400, detail=f"Amount must be between {plan['min_investment']} and {plan['max_investment']}")
    
    # Verify payment if provided
    if payment_transaction_id:
        payment = await db.payment_transactions.find_one(
            {"transaction_id": payment_transaction_id, "user_id": user["user_id"], "status": "completed"},
            {"_id": 0}
        )
        if not payment:
            raise HTTPException(status_code=400, detail="Valid completed payment required")
    
    start_date = datetime.now(timezone.utc)
    end_date = start_date + timedelta(days=plan["lock_period_days"])
    
    investment = {
        "investment_id": f"inv_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "plan_id": plan_id,
        "segment_id": plan["segment_id"],
        "amount": amount,
        "apy": plan["apy"],
        "lock_period_days": plan["lock_period_days"],
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "status": "active",
        "rewards_earned": 0.0
    }
    
    await db.investments.insert_one(investment)
    investment.pop("_id", None)
    return investment

@api_router.get("/portfolio/stats")
async def get_portfolio_stats(user: dict = Depends(require_auth)):
    """Get portfolio statistics for dashboard"""
    investments = await db.investments.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    
    total_invested = sum(inv["amount"] for inv in investments)
    active_investments = [inv for inv in investments if inv["status"] == "active"]
    
    # Calculate rewards (simplified)
    total_rewards = 0
    for inv in active_investments:
        start_date = datetime.fromisoformat(inv["start_date"]) if isinstance(inv["start_date"], str) else inv["start_date"]
        if start_date.tzinfo is None:
            start_date = start_date.replace(tzinfo=timezone.utc)
        days_active = (datetime.now(timezone.utc) - start_date).days
        daily_rate = inv["apy"] / 365 / 100
        total_rewards += inv["amount"] * daily_rate * days_active
    
    # Calculate impact metrics (estimated)
    co2_offset = total_invested * 0.0005  # 0.5kg CO2 per dollar invested
    kwh_generated = total_invested * 0.1  # 0.1 kWh per dollar invested
    
    return {
        "total_invested": round(total_invested, 2),
        "total_rewards": round(total_rewards, 2),
        "active_investments_count": len(active_investments),
        "portfolio_value": round(total_invested + total_rewards, 2),
        "impact_metrics": {
            "co2_offset_kg": round(co2_offset, 2),
            "kwh_generated": round(kwh_generated, 2),
            "trees_equivalent": round(co2_offset / 21, 1)  # ~21kg CO2 per tree/year
        }
    }

# ============= PAYMENT ROUTES =============

@api_router.post("/payments/checkout")
async def create_checkout_session(request: Request, user: dict = Depends(require_auth)):
    """Create Stripe checkout session"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    body = await request.json()
    plan_id = body.get("plan_id")
    amount = body.get("amount")
    origin_url = body.get("origin_url")
    
    # Validate plan and amount server-side
    plan = next((p for p in INVESTMENT_PLANS if p["plan_id"] == plan_id), None)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    if amount < plan["min_investment"] or amount > plan["max_investment"]:
        raise HTTPException(status_code=400, detail=f"Amount must be between {plan['min_investment']} and {plan['max_investment']}")
    
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Payment service not configured")
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    success_url = f"{origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/payment/cancel"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(amount),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["user_id"],
            "plan_id": plan_id,
            "amount": str(amount)
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    payment_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "amount": float(amount),
        "currency": "usd",
        "payment_method": "stripe",
        "session_id": session.session_id,
        "status": "pending",
        "metadata": {"plan_id": plan_id},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(payment_doc)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, user: dict = Depends(require_auth)):
    """Get payment status and update if completed"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Payment service not configured")
    
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    try:
        status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update payment transaction
        payment = await db.payment_transactions.find_one(
            {"session_id": session_id, "user_id": user["user_id"]},
            {"_id": 0}
        )
        
        if payment and payment["status"] != "completed" and status.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"status": "completed"}}
            )
            
            # Auto-create investment if payment completed
            plan_id = payment["metadata"].get("plan_id")
            if plan_id:
                plan = next((p for p in INVESTMENT_PLANS if p["plan_id"] == plan_id), None)
                if plan:
                    start_date = datetime.now(timezone.utc)
                    end_date = start_date + timedelta(days=plan["lock_period_days"])
                    
                    investment = {
                        "investment_id": f"inv_{uuid.uuid4().hex[:12]}",
                        "user_id": user["user_id"],
                        "plan_id": plan_id,
                        "segment_id": plan["segment_id"],
                        "amount": payment["amount"],
                        "apy": plan["apy"],
                        "lock_period_days": plan["lock_period_days"],
                        "start_date": start_date.isoformat(),
                        "end_date": end_date.isoformat(),
                        "status": "active",
                        "rewards_earned": 0.0
                    }
                    await db.investments.insert_one(investment)
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency,
            "transaction_id": payment["transaction_id"] if payment else None
        }
    except Exception as e:
        logger.error(f"Payment status error: {e}")
        raise HTTPException(status_code=500, detail="Failed to check payment status")

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        return {"status": "error", "message": "Not configured"}
    
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {"status": "completed"}}
            )
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error"}

# ============= CALCULATOR ROUTES =============

@api_router.post("/calculator")
async def calculate_returns(request: Request):
    """Calculate projected returns for an investment"""
    body = await request.json()
    plan_id = body.get("plan_id")
    amount = body.get("amount", 0)
    
    plan = next((p for p in INVESTMENT_PLANS if p["plan_id"] == plan_id), None)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    daily_rate = plan["apy"] / 365 / 100
    
    daily_return = amount * daily_rate
    monthly_return = amount * daily_rate * 30
    yearly_return = amount * (plan["apy"] / 100)
    lock_period_return = amount * daily_rate * plan["lock_period_days"]
    
    return {
        "plan": plan,
        "investment_amount": amount,
        "projected_returns": {
            "daily": round(daily_return, 2),
            "monthly": round(monthly_return, 2),
            "yearly": round(yearly_return, 2),
            "lock_period": round(lock_period_return, 2)
        },
        "total_at_end": round(amount + lock_period_return, 2)
    }

# ============= BASIC ROUTES =============

@api_router.get("/")
async def root():
    return {"message": "EcoDePIN API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include the router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
