from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="CK Financial Master Planner API")

# --- ADD THIS CORS SECTION HERE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits all domains for testing in Codespaces
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],  # Allows all headers (Content-Type, etc.)
)
# ----------------------------------

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ MODELS ============

class TimelineInputs(BaseModel):
    revenue_start_month: int = 7
    projection_years: int = 5
    inflation_rate: float = 6.0
    scenario: str = "base"

class UserGrowthInputs(BaseModel):
    artists_y1: int = 5000
    artists_y2: int = 25000
    artists_y3: int = 75000
    artists_y4: int = 150000
    artists_y5: int = 300000
    cds_y1: int = 200
    cds_y2: int = 800
    cds_y3: int = 2000
    cds_y4: int = 5000
    cds_y5: int = 12000

class ArtistMonetization(BaseModel):
    premium_price: float = 299.0
    conversion_rate: float = 5.0
    churn_rate: float = 8.0

class CDMonetization(BaseModel):
    premium_price: float = 999.0
    conversion_rate: float = 15.0
    churn_rate: float = 5.0

class TransactionalInputs(BaseModel):
    avg_jobs_per_cd: float = 3.0
    job_boost_price: float = 199.0
    boost_percentage: float = 20.0
    escrow_fee_percentage: float = 5.0
    escrow_enabled_year: int = 3

# Dynamic Team Member
class TeamMember(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Team Member"
    role: str = "employee"  # founder, intern, employee, other
    monthly_salary: float = 0.0
    start_month: int = 1  # 1-12
    start_year: int = 1   # 1-5

class TeamCosts(BaseModel):
    members: List[TeamMember] = Field(default_factory=lambda: [
        TeamMember(name="Founder 1", role="founder", monthly_salary=0, start_month=1, start_year=1),
        TeamMember(name="Founder 2", role="founder", monthly_salary=0, start_month=1, start_year=1),
        TeamMember(name="Dev Intern", role="intern", monthly_salary=15000, start_month=1, start_year=1),
        TeamMember(name="Design Intern", role="intern", monthly_salary=15000, start_month=1, start_year=1),
    ])
    esop_percentage: float = 10.0

# Physical Infrastructure
class PhysicalInfraCosts(BaseModel):
    office_rent: float = 0.0
    electricity: float = 2000.0
    internet: float = 2000.0
    maintenance: float = 1000.0
    office_start_month: int = 1
    office_start_year: int = 2  # Office from Year 2

# Digital Infrastructure
class DigitalInfraCosts(BaseModel):
    hosting: float = 5000.0
    storage: float = 2000.0
    ai_compute: float = 0.0
    ai_enabled_year: int = 2
    ai_compute_enabled: float = 10000.0
    saas_tools: float = 8000.0

# Hardware Costs
class HardwareItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Laptop"
    unit_cost: float = 60000.0
    quantity: int = 1
    purchase_month: int = 1
    purchase_year: int = 1

class HardwareCosts(BaseModel):
    items: List[HardwareItem] = Field(default_factory=lambda: [
        HardwareItem(name="Laptop", unit_cost=60000, quantity=2, purchase_month=1, purchase_year=1),
        HardwareItem(name="Office Chair", unit_cost=8000, quantity=4, purchase_month=1, purchase_year=2),
        HardwareItem(name="Desk/Table", unit_cost=5000, quantity=4, purchase_month=1, purchase_year=2),
        HardwareItem(name="Stationery", unit_cost=2000, quantity=1, purchase_month=1, purchase_year=1),
    ])

class MarketingCosts(BaseModel):
    organic: float = 10000.0
    paid: float = 20000.0
    influencer: float = 15000.0

class AdminCosts(BaseModel):
    legal: float = 10000.0
    compliance: float = 5000.0
    accounting: float = 8000.0
    misc_buffer_percentage: float = 10.0

# Travel Costs
class TravelItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Business Travel"
    estimated_monthly: float = 0.0
    start_month: int = 1
    start_year: int = 2
    is_recurring: bool = True  # Monthly recurring or one-time

class TravelCosts(BaseModel):
    items: List[TravelItem] = Field(default_factory=lambda: [
        TravelItem(name="Local Travel", estimated_monthly=5000, start_month=1, start_year=1, is_recurring=True),
        TravelItem(name="Client Meetings", estimated_monthly=10000, start_month=1, start_year=2, is_recurring=True),
    ])

# Other Expenses (Dynamic)
class OtherExpenseItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Miscellaneous"
    amount: float = 0.0
    start_month: int = 1
    start_year: int = 1
    is_recurring: bool = True  # Monthly recurring or one-time

class OtherExpenses(BaseModel):
    items: List[OtherExpenseItem] = Field(default_factory=lambda: [
        OtherExpenseItem(name="Miscellaneous", amount=5000, start_month=1, start_year=1, is_recurring=True),
    ])

# Other Income (Dynamic)
class OtherIncomeItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Other Income"
    amount: float = 0.0
    start_month: int = 1
    start_year: int = 1
    is_recurring: bool = True  # Monthly recurring or one-time

class OtherIncome(BaseModel):
    items: List[OtherIncomeItem] = Field(default_factory=lambda: [
        OtherIncomeItem(name="Google Ads Revenue", amount=0, start_month=7, start_year=2, is_recurring=True),
    ])

class TaxInputs(BaseModel):
    corporate_tax_rate: float = 25.0
    gst_applicable: bool = True
    gst_rate: float = 18.0
    tds_rate: float = 10.0
    depreciation_rate: float = 15.0

# Dynamic Funding Rounds
class FundingRound(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Seed Round"
    amount: float = 5000000.0
    month: int = 1
    year: int = 1
    investor: str = ""
    notes: str = ""

class FundingInputs(BaseModel):
    rounds: List[FundingRound] = Field(default_factory=lambda: [
        FundingRound(name="Seed Round", amount=5000000, month=1, year=1, investor="Angel Investors", notes="Initial capital"),
        FundingRound(name="Series A", amount=25000000, month=1, year=3, investor="VC Fund", notes="Growth funding"),
    ])

class FinancialInputs(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "CK Financial Projection"
    timeline: TimelineInputs = Field(default_factory=TimelineInputs)
    user_growth: UserGrowthInputs = Field(default_factory=UserGrowthInputs)
    artist_monetization: ArtistMonetization = Field(default_factory=ArtistMonetization)
    cd_monetization: CDMonetization = Field(default_factory=CDMonetization)
    transactional: TransactionalInputs = Field(default_factory=TransactionalInputs)
    team_costs: TeamCosts = Field(default_factory=TeamCosts)
    physical_infra: PhysicalInfraCosts = Field(default_factory=PhysicalInfraCosts)
    digital_infra: DigitalInfraCosts = Field(default_factory=DigitalInfraCosts)
    hardware_costs: HardwareCosts = Field(default_factory=HardwareCosts)
    marketing_costs: MarketingCosts = Field(default_factory=MarketingCosts)
    admin_costs: AdminCosts = Field(default_factory=AdminCosts)
    travel_costs: TravelCosts = Field(default_factory=TravelCosts)
    other_expenses: OtherExpenses = Field(default_factory=OtherExpenses)
    other_income: OtherIncome = Field(default_factory=OtherIncome)
    tax_inputs: TaxInputs = Field(default_factory=TaxInputs)
    funding: FundingInputs = Field(default_factory=FundingInputs)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FinancialInputsCreate(BaseModel):
    name: Optional[str] = "CK Financial Projection"
    timeline: Optional[TimelineInputs] = None
    user_growth: Optional[UserGrowthInputs] = None
    artist_monetization: Optional[ArtistMonetization] = None
    cd_monetization: Optional[CDMonetization] = None
    transactional: Optional[TransactionalInputs] = None
    team_costs: Optional[TeamCosts] = None
    physical_infra: Optional[PhysicalInfraCosts] = None
    digital_infra: Optional[DigitalInfraCosts] = None
    hardware_costs: Optional[HardwareCosts] = None
    marketing_costs: Optional[MarketingCosts] = None
    admin_costs: Optional[AdminCosts] = None
    travel_costs: Optional[TravelCosts] = None
    other_expenses: Optional[OtherExpenses] = None
    other_income: Optional[OtherIncome] = None
    tax_inputs: Optional[TaxInputs] = None
    funding: Optional[FundingInputs] = None

# ============ FINANCIAL CALCULATIONS ============

def get_scenario_multiplier(scenario: str) -> Dict[str, float]:
    """Returns multipliers for different scenarios"""
    multipliers = {
        "conservative": {"growth": 0.7, "conversion": 0.8, "cost": 1.2},
        "base": {"growth": 1.0, "conversion": 1.0, "cost": 1.0},
        "aggressive": {"growth": 1.4, "conversion": 1.2, "cost": 0.9}
    }
    return multipliers.get(scenario, multipliers["base"])

def calculate_monthly_users(inputs: FinancialInputs) -> Dict[str, Any]:
    """Calculate monthly user growth for Year 1 and annual for Years 1-5"""
    ug = inputs.user_growth
    scenario_mult = get_scenario_multiplier(inputs.timeline.scenario)
    growth_mult = scenario_mult["growth"]
    
    # Annual targets with scenario adjustment
    artist_targets = [
        int(ug.artists_y1 * growth_mult),
        int(ug.artists_y2 * growth_mult),
        int(ug.artists_y3 * growth_mult),
        int(ug.artists_y4 * growth_mult),
        int(ug.artists_y5 * growth_mult)
    ]
    
    cd_targets = [
        int(ug.cds_y1 * growth_mult),
        int(ug.cds_y2 * growth_mult),
        int(ug.cds_y3 * growth_mult),
        int(ug.cds_y4 * growth_mult),
        int(ug.cds_y5 * growth_mult)
    ]
    
    # Monthly breakdown for Year 1 (exponential smoothing)
    monthly_artists = []
    monthly_cds = []
    
    for month in range(1, 13):
        progress = month / 12
        artists = int(artist_targets[0] * (progress ** 1.5))
        cds = int(cd_targets[0] * (progress ** 1.5))
        monthly_artists.append(artists)
        monthly_cds.append(cds)
    
    return {
        "monthly_artists": monthly_artists,
        "monthly_cds": monthly_cds,
        "annual_artists": artist_targets,
        "annual_cds": cd_targets
    }

def calculate_revenue(inputs: FinancialInputs, users: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate revenue breakdown monthly and annually"""
    am = inputs.artist_monetization
    cm = inputs.cd_monetization
    tx = inputs.transactional
    oi = inputs.other_income
    scenario_mult = get_scenario_multiplier(inputs.timeline.scenario)
    conv_mult = scenario_mult["conversion"]
    
    revenue_start = inputs.timeline.revenue_start_month
    
    # Monthly revenue for Year 1
    monthly_revenue = {
        "artist_premium": [],
        "cd_premium": [],
        "boosts": [],
        "escrow": [],
        "other_income": [],
        "total": []
    }
    
    for month in range(1, 13):
        # Calculate other income for this month (Year 1)
        other_inc = 0
        for item in oi.items:
            if item.start_year == 1 and month >= item.start_month:
                if item.is_recurring:
                    other_inc += item.amount
                elif month == item.start_month:
                    other_inc += item.amount
        
        if month < revenue_start:
            monthly_revenue["artist_premium"].append(0)
            monthly_revenue["cd_premium"].append(0)
            monthly_revenue["boosts"].append(0)
            monthly_revenue["escrow"].append(0)
            monthly_revenue["other_income"].append(other_inc)
            monthly_revenue["total"].append(other_inc)
        else:
            artists = users["monthly_artists"][month - 1]
            cds = users["monthly_cds"][month - 1]
            
            artist_premium = int(artists * (am.conversion_rate * conv_mult / 100) * am.premium_price)
            cd_premium = int(cds * (cm.conversion_rate * conv_mult / 100) * cm.premium_price)
            boost_revenue = int(cds * tx.avg_jobs_per_cd * (tx.boost_percentage / 100) * tx.job_boost_price)
            escrow_rev = 0
            
            total = artist_premium + cd_premium + boost_revenue + escrow_rev + other_inc
            
            monthly_revenue["artist_premium"].append(artist_premium)
            monthly_revenue["cd_premium"].append(cd_premium)
            monthly_revenue["boosts"].append(boost_revenue)
            monthly_revenue["escrow"].append(escrow_rev)
            monthly_revenue["other_income"].append(other_inc)
            monthly_revenue["total"].append(total)
    
    # Annual revenue for Years 1-5
    annual_revenue = {
        "artist_premium": [],
        "cd_premium": [],
        "boosts": [],
        "escrow": [],
        "other_income": [],
        "total": []
    }
    
    for year in range(5):
        artists = users["annual_artists"][year]
        cds = users["annual_cds"][year]
        
        active_months = 12 if year > 0 else (12 - revenue_start + 1)
        churn_factor = 1 - (am.churn_rate / 100 / 12 * 6)
        
        artist_premium = int(artists * (am.conversion_rate * conv_mult / 100) * am.premium_price * active_months * churn_factor)
        cd_premium = int(cds * (cm.conversion_rate * conv_mult / 100) * cm.premium_price * active_months * (1 - cm.churn_rate / 100 / 12 * 6))
        boost_revenue = int(cds * tx.avg_jobs_per_cd * (tx.boost_percentage / 100) * tx.job_boost_price * active_months)
        
        if year + 1 >= tx.escrow_enabled_year:
            avg_job_value = 50000
            escrow_rev = int(cds * tx.avg_jobs_per_cd * avg_job_value * (tx.escrow_fee_percentage / 100) * active_months * 0.3)
        else:
            escrow_rev = 0
        
        # Calculate other income for this year
        other_inc = 0
        for item in oi.items:
            if item.start_year <= year + 1:
                if item.is_recurring:
                    if item.start_year == year + 1:
                        other_inc += item.amount * (12 - item.start_month + 1)
                    else:
                        other_inc += item.amount * 12
                elif item.start_year == year + 1:
                    other_inc += item.amount
        
        total = artist_premium + cd_premium + boost_revenue + escrow_rev + other_inc
        
        annual_revenue["artist_premium"].append(artist_premium)
        annual_revenue["cd_premium"].append(cd_premium)
        annual_revenue["boosts"].append(boost_revenue)
        annual_revenue["escrow"].append(escrow_rev)
        annual_revenue["other_income"].append(int(other_inc))
        annual_revenue["total"].append(total)
    
    return {
        "monthly": monthly_revenue,
        "annual": annual_revenue
    }

def calculate_team_costs_detailed(inputs: FinancialInputs, year: int, month: int = None) -> float:
    """Calculate team costs for a specific year and optionally month"""
    tc = inputs.team_costs
    scenario_mult = get_scenario_multiplier(inputs.timeline.scenario)
    cost_mult = scenario_mult["cost"]
    inflation = inputs.timeline.inflation_rate / 100
    inflation_factor = (1 + inflation) ** (year - 1)
    
    total = 0
    for member in tc.members:
        member_start_abs_month = (member.start_year - 1) * 12 + member.start_month
        
        if month is not None:
            # Monthly calculation
            current_abs_month = month
            if current_abs_month >= member_start_abs_month:
                total += member.monthly_salary
        else:
            # Annual calculation
            year_start_abs = (year - 1) * 12 + 1
            year_end_abs = year * 12
            
            if member_start_abs_month <= year_end_abs:
                start = max(member_start_abs_month, year_start_abs)
                active_months = year_end_abs - start + 1
                total += member.monthly_salary * active_months
    
    # Add ESOP cost
    esop_cost = total * (tc.esop_percentage / 100)
    total += esop_cost
    
    return total * inflation_factor * cost_mult

def calculate_costs(inputs: FinancialInputs) -> Dict[str, Any]:
    """Calculate costs breakdown monthly and annually"""
    di = inputs.digital_infra
    pi = inputs.physical_infra
    hw = inputs.hardware_costs
    mc = inputs.marketing_costs
    ac = inputs.admin_costs
    tc = inputs.travel_costs
    oe = inputs.other_expenses
    scenario_mult = get_scenario_multiplier(inputs.timeline.scenario)
    cost_mult = scenario_mult["cost"]
    
    # Monthly costs for Year 1
    monthly_costs = {
        "team": [],
        "digital_infra": [],
        "physical_infra": [],
        "hardware": [],
        "marketing": [],
        "travel": [],
        "admin": [],
        "other": [],
        "total": []
    }
    
    for month in range(1, 13):
        # Team costs
        team = calculate_team_costs_detailed(inputs, 1, month)
        
        # Digital Infrastructure
        digital = (di.hosting + di.storage + di.saas_tools) * cost_mult
        
        # Physical Infrastructure (check if started)
        if pi.office_start_year == 1 and month >= pi.office_start_month:
            physical = (pi.office_rent + pi.electricity + pi.internet + pi.maintenance) * cost_mult
        else:
            physical = 0
        
        # Hardware (one-time purchases)
        hardware = 0
        for item in hw.items:
            if item.purchase_year == 1 and item.purchase_month == month:
                hardware += item.unit_cost * item.quantity
        
        # Marketing
        marketing_ramp = min(1.0, month / 6)
        marketing = (mc.organic + mc.paid * marketing_ramp + mc.influencer * marketing_ramp) * cost_mult
        
        # Travel
        travel = 0
        for item in tc.items:
            if item.start_year == 1 and month >= item.start_month:
                if item.is_recurring:
                    travel += item.estimated_monthly
                elif month == item.start_month:
                    travel += item.estimated_monthly
        travel *= cost_mult
        
        # Admin
        admin_base = (ac.legal + ac.compliance + ac.accounting) * cost_mult
        admin = admin_base * (1 + ac.misc_buffer_percentage / 100)
        
        # Other Expenses
        other = 0
        for item in oe.items:
            if item.start_year == 1 and month >= item.start_month:
                if item.is_recurring:
                    other += item.amount
                elif month == item.start_month:
                    other += item.amount
        other *= cost_mult
        
        total = team + digital + physical + hardware + marketing + travel + admin + other
        
        monthly_costs["team"].append(int(team))
        monthly_costs["digital_infra"].append(int(digital))
        monthly_costs["physical_infra"].append(int(physical))
        monthly_costs["hardware"].append(int(hardware))
        monthly_costs["marketing"].append(int(marketing))
        monthly_costs["travel"].append(int(travel))
        monthly_costs["admin"].append(int(admin))
        monthly_costs["other"].append(int(other))
        monthly_costs["total"].append(int(total))
    
    # Annual costs for Years 1-5
    annual_costs = {
        "team": [],
        "digital_infra": [],
        "physical_infra": [],
        "hardware": [],
        "marketing": [],
        "travel": [],
        "admin": [],
        "other": [],
        "total": []
    }
    
    inflation = inputs.timeline.inflation_rate / 100
    
    for year in range(5):
        inflation_factor = (1 + inflation) ** year
        
        # Team costs
        team = calculate_team_costs_detailed(inputs, year + 1)
        
        # Digital Infrastructure
        ai_cost = di.ai_compute_enabled if year + 1 >= di.ai_enabled_year else 0
        digital = (di.hosting + di.storage + ai_cost + di.saas_tools) * 12 * inflation_factor * cost_mult
        
        # Physical Infrastructure
        if year + 1 >= pi.office_start_year:
            if year + 1 == pi.office_start_year:
                active_months = 12 - pi.office_start_month + 1
            else:
                active_months = 12
            physical = (pi.office_rent + pi.electricity + pi.internet + pi.maintenance) * active_months * inflation_factor * cost_mult
        else:
            physical = 0
        
        # Hardware
        hardware = 0
        for item in hw.items:
            if item.purchase_year == year + 1:
                hardware += item.unit_cost * item.quantity
        
        # Marketing
        marketing_scale = 1 + year * 0.5
        marketing = (mc.organic + mc.paid + mc.influencer) * 12 * marketing_scale * inflation_factor * cost_mult
        
        # Travel
        travel = 0
        for item in tc.items:
            if item.start_year <= year + 1:
                if item.is_recurring:
                    if item.start_year == year + 1:
                        travel += item.estimated_monthly * (12 - item.start_month + 1)
                    else:
                        travel += item.estimated_monthly * 12
                elif item.start_year == year + 1:
                    travel += item.estimated_monthly
        travel *= inflation_factor * cost_mult
        
        # Admin
        admin_base = (ac.legal + ac.compliance + ac.accounting) * 12 * inflation_factor * cost_mult
        admin = admin_base * (1 + ac.misc_buffer_percentage / 100)
        
        # Other Expenses
        other = 0
        for item in oe.items:
            if item.start_year <= year + 1:
                if item.is_recurring:
                    if item.start_year == year + 1:
                        other += item.amount * (12 - item.start_month + 1)
                    else:
                        other += item.amount * 12
                elif item.start_year == year + 1:
                    other += item.amount
        other *= inflation_factor * cost_mult
        
        total = team + digital + physical + hardware + marketing + travel + admin + other
        
        annual_costs["team"].append(int(team))
        annual_costs["digital_infra"].append(int(digital))
        annual_costs["physical_infra"].append(int(physical))
        annual_costs["hardware"].append(int(hardware))
        annual_costs["marketing"].append(int(marketing))
        annual_costs["travel"].append(int(travel))
        annual_costs["admin"].append(int(admin))
        annual_costs["other"].append(int(other))
        annual_costs["total"].append(int(total))
    
    return {
        "monthly": monthly_costs,
        "annual": annual_costs
    }

def calculate_pnl(revenue: Dict, costs: Dict, inputs: FinancialInputs) -> Dict[str, Any]:
    """Calculate Profit & Loss statement"""
    tax = inputs.tax_inputs
    
    # Monthly P&L for Year 1
    monthly_pnl = {
        "revenue": revenue["monthly"]["total"],
        "gross_profit": [],
        "operating_expenses": costs["monthly"]["total"],
        "ebitda": [],
        "depreciation": [],
        "ebit": [],
        "taxes": [],
        "net_profit": []
    }
    
    for month in range(12):
        rev = revenue["monthly"]["total"][month]
        opex = costs["monthly"]["total"][month]
        gross_margin = 0.85
        
        gross_profit = int(rev * gross_margin)
        ebitda = gross_profit - opex
        depreciation = int(opex * (tax.depreciation_rate / 100 / 12))
        ebit = ebitda - depreciation
        taxes = max(0, int(ebit * (tax.corporate_tax_rate / 100))) if ebit > 0 else 0
        net_profit = ebit - taxes
        
        monthly_pnl["gross_profit"].append(gross_profit)
        monthly_pnl["ebitda"].append(ebitda)
        monthly_pnl["depreciation"].append(depreciation)
        monthly_pnl["ebit"].append(ebit)
        monthly_pnl["taxes"].append(taxes)
        monthly_pnl["net_profit"].append(net_profit)
    
    # Annual P&L for Years 1-5
    annual_pnl = {
        "revenue": revenue["annual"]["total"],
        "gross_profit": [],
        "operating_expenses": costs["annual"]["total"],
        "ebitda": [],
        "depreciation": [],
        "ebit": [],
        "taxes": [],
        "net_profit": []
    }
    
    for year in range(5):
        rev = revenue["annual"]["total"][year]
        opex = costs["annual"]["total"][year]
        gross_margin = 0.85
        
        gross_profit = int(rev * gross_margin)
        ebitda = gross_profit - opex
        depreciation = int(opex * (tax.depreciation_rate / 100))
        ebit = ebitda - depreciation
        taxes = max(0, int(ebit * (tax.corporate_tax_rate / 100))) if ebit > 0 else 0
        net_profit = ebit - taxes
        
        annual_pnl["gross_profit"].append(gross_profit)
        annual_pnl["ebitda"].append(ebitda)
        annual_pnl["depreciation"].append(depreciation)
        annual_pnl["ebit"].append(ebit)
        annual_pnl["taxes"].append(taxes)
        annual_pnl["net_profit"].append(net_profit)
    
    return {
        "monthly": monthly_pnl,
        "annual": annual_pnl
    }

def calculate_cashflow(pnl: Dict, inputs: FinancialInputs) -> Dict[str, Any]:
    """Calculate cash flow and runway"""
    funding = inputs.funding
    
    # Calculate total initial funding (Year 1)
    initial_cash = sum(r.amount for r in funding.rounds if r.year == 1)
    
    # Monthly cash flow for Year 1
    monthly_cashflow = {
        "operating_cash_flow": [],
        "net_burn": [],
        "cumulative_cash": [],
        "runway_months": []
    }
    
    cumulative = initial_cash
    
    for month in range(12):
        ocf = pnl["monthly"]["ebitda"][month]
        net_burn = -ocf if ocf < 0 else 0
        cumulative += ocf
        
        avg_burn = sum(monthly_cashflow["net_burn"][-3:] + [net_burn]) / min(month + 1, 4) if net_burn > 0 else net_burn
        runway = int(cumulative / avg_burn) if avg_burn > 0 else 999
        
        monthly_cashflow["operating_cash_flow"].append(ocf)
        monthly_cashflow["net_burn"].append(net_burn)
        monthly_cashflow["cumulative_cash"].append(int(cumulative))
        monthly_cashflow["runway_months"].append(min(runway, 999))
    
    # Annual cash flow for Years 1-5
    annual_cashflow = {
        "operating_cash_flow": [],
        "net_burn": [],
        "cumulative_cash": [],
        "funding_received": []
    }
    
    cumulative = 0
    
    for year in range(5):
        ocf = pnl["annual"]["ebitda"][year]
        
        # Calculate funding for this year
        funding_received = sum(r.amount for r in funding.rounds if r.year == year + 1)
        
        cumulative += ocf + funding_received
        net_burn = -ocf if ocf < 0 else 0
        
        annual_cashflow["operating_cash_flow"].append(ocf)
        annual_cashflow["net_burn"].append(net_burn)
        annual_cashflow["cumulative_cash"].append(int(cumulative))
        annual_cashflow["funding_received"].append(funding_received)
    
    return {
        "monthly": monthly_cashflow,
        "annual": annual_cashflow,
        "initial_funding": initial_cash
    }

def calculate_unit_economics(revenue: Dict, users: Dict, costs: Dict, inputs: FinancialInputs) -> Dict[str, Any]:
    """Calculate unit economics metrics"""
    am = inputs.artist_monetization
    cm = inputs.cd_monetization
    scenario_mult = get_scenario_multiplier(inputs.timeline.scenario)
    
    metrics = {
        "arpu_artists": [],
        "arpu_cds": [],
        "gross_margin_per_user": [],
        "contribution_margin": [],
        "break_even_month": 0,
        "break_even_year": 0
    }
    
    for year in range(5):
        artists = users["annual_artists"][year]
        cds = users["annual_cds"][year]
        total_users = artists + cds
        
        total_rev = revenue["annual"]["total"][year]
        total_cost = costs["annual"]["total"][year]
        
        arpu_artists = revenue["annual"]["artist_premium"][year] / max(artists * (am.conversion_rate / 100), 1)
        arpu_cds = (revenue["annual"]["cd_premium"][year] + revenue["annual"]["boosts"][year]) / max(cds, 1)
        
        gross_margin = (total_rev * 0.85) / max(total_users, 1)
        variable_costs = costs["annual"]["marketing"][year] / max(total_users, 1)
        contribution_margin = gross_margin - variable_costs
        
        metrics["arpu_artists"].append(int(arpu_artists))
        metrics["arpu_cds"].append(int(arpu_cds))
        metrics["gross_margin_per_user"].append(int(gross_margin))
        metrics["contribution_margin"].append(int(contribution_margin))
    
    # Find break-even point
    cumulative_profit = 0
    for month in range(60):
        year_idx = month // 12
        month_in_year = month % 12
        
        if year_idx == 0:
            monthly_profit = revenue["monthly"]["total"][month_in_year] * 0.85 - costs["monthly"]["total"][month_in_year]
        else:
            monthly_profit = (revenue["annual"]["total"][year_idx] * 0.85 - costs["annual"]["total"][year_idx]) / 12
        
        cumulative_profit += monthly_profit
        
        if cumulative_profit > 0 and metrics["break_even_month"] == 0:
            metrics["break_even_month"] = month + 1
            metrics["break_even_year"] = (month // 12) + 1
    
    return metrics

def calculate_key_metrics(revenue: Dict, costs: Dict, pnl: Dict, inputs: FinancialInputs) -> Dict[str, Any]:
    """Calculate VC-style key metrics"""
    
    metrics = {
        "revenue_cagr": 0,
        "cost_cagr": 0,
        "gross_margin_pct": [],
        "ebitda_margin_pct": [],
        "burn_multiple": [],
        "rule_of_40": [],
        "capital_efficiency": []
    }
    
    rev_y1 = max(revenue["annual"]["total"][0], 1)
    rev_y5 = max(revenue["annual"]["total"][4], 1)
    metrics["revenue_cagr"] = round(((rev_y5 / rev_y1) ** (1/4) - 1) * 100, 1)
    
    cost_y1 = max(costs["annual"]["total"][0], 1)
    cost_y5 = max(costs["annual"]["total"][4], 1)
    metrics["cost_cagr"] = round(((cost_y5 / cost_y1) ** (1/4) - 1) * 100, 1)
    
    # Calculate total funding
    total_funding = sum(r.amount for r in inputs.funding.rounds)
    
    for year in range(5):
        rev = max(revenue["annual"]["total"][year], 1)
        cost = costs["annual"]["total"][year]
        ebitda = pnl["annual"]["ebitda"][year]
        
        gross_margin = round((rev * 0.85 / rev) * 100, 1)
        ebitda_margin = round((ebitda / rev) * 100, 1)
        
        if year > 0:
            new_arr = revenue["annual"]["total"][year] - revenue["annual"]["total"][year - 1]
            burn = -ebitda if ebitda < 0 else 0
            burn_multiple = round(burn / max(new_arr, 1), 2) if burn > 0 else 0
        else:
            burn_multiple = round(-ebitda / max(rev, 1), 2) if ebitda < 0 else 0
        
        if year > 0:
            growth_rate = ((revenue["annual"]["total"][year] / max(revenue["annual"]["total"][year - 1], 1)) - 1) * 100
        else:
            growth_rate = 0
        rule_of_40 = round(growth_rate + ebitda_margin, 1)
        
        # Capital efficiency based on funding received up to this year
        funding_till_year = sum(r.amount for r in inputs.funding.rounds if r.year <= year + 1)
        capital_eff = round(rev / max(funding_till_year, 1), 2)
        
        metrics["gross_margin_pct"].append(gross_margin)
        metrics["ebitda_margin_pct"].append(ebitda_margin)
        metrics["burn_multiple"].append(burn_multiple)
        metrics["rule_of_40"].append(rule_of_40)
        metrics["capital_efficiency"].append(capital_eff)
    
    return metrics

def calculate_all_scenarios(base_inputs: FinancialInputs) -> Dict[str, Any]:
    """Calculate projections for all three scenarios"""
    scenarios = {}
    
    for scenario in ["conservative", "base", "aggressive"]:
        scenario_inputs = base_inputs.model_copy(deep=True)
        scenario_inputs.timeline.scenario = scenario
        
        users = calculate_monthly_users(scenario_inputs)
        revenue = calculate_revenue(scenario_inputs, users)
        costs = calculate_costs(scenario_inputs)
        pnl = calculate_pnl(revenue, costs, scenario_inputs)
        cashflow = calculate_cashflow(pnl, scenario_inputs)
        
        scenarios[scenario] = {
            "revenue": revenue["annual"]["total"],
            "costs": costs["annual"]["total"],
            "ebitda": pnl["annual"]["ebitda"],
            "cumulative_cash": cashflow["annual"]["cumulative_cash"]
        }
    
    return scenarios

# ============ API ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "CK Financial Projection Planner API", "version": "2.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

@api_router.get("/inputs/default", response_model=FinancialInputs)
async def get_default_inputs():
    """Get default financial inputs"""
    return FinancialInputs()

@api_router.post("/inputs", response_model=FinancialInputs)
async def save_inputs(inputs: FinancialInputsCreate):
    """Save financial inputs to database"""
    input_obj = FinancialInputs(
        name=inputs.name or "CK Financial Plan",
        timeline=inputs.timeline or TimelineInputs(),
        user_growth=inputs.user_growth or UserGrowthInputs(),
        artist_monetization=inputs.artist_monetization or ArtistMonetization(),
        cd_monetization=inputs.cd_monetization or CDMonetization(),
        transactional=inputs.transactional or TransactionalInputs(),
        team_costs=inputs.team_costs or TeamCosts(),
        physical_infra=inputs.physical_infra or PhysicalInfraCosts(),
        digital_infra=inputs.digital_infra or DigitalInfraCosts(),
        hardware_costs=inputs.hardware_costs or HardwareCosts(),
        marketing_costs=inputs.marketing_costs or MarketingCosts(),
        admin_costs=inputs.admin_costs or AdminCosts(),
        travel_costs=inputs.travel_costs or TravelCosts(),
        other_expenses=inputs.other_expenses or OtherExpenses(),
        other_income=inputs.other_income or OtherIncome(),
        tax_inputs=inputs.tax_inputs or TaxInputs(),
        funding=inputs.funding or FundingInputs()
    )
    
    doc = input_obj.model_dump()
    await db.financial_inputs.insert_one(doc)
    
    return input_obj

@api_router.get("/inputs", response_model=List[FinancialInputs])
async def get_all_inputs():
    """Get all saved financial inputs"""
    inputs = await db.financial_inputs.find({}, {"_id": 0}).to_list(100)
    return inputs

@api_router.get("/inputs/{input_id}", response_model=FinancialInputs)
async def get_input(input_id: str):
    """Get specific financial input by ID"""
    doc = await db.financial_inputs.find_one({"id": input_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Input not found")
    return doc

@api_router.post("/calculate")
async def calculate_projections(inputs: FinancialInputs):
    """Calculate all financial projections based on inputs"""
    users = calculate_monthly_users(inputs)
    revenue = calculate_revenue(inputs, users)
    costs = calculate_costs(inputs)
    pnl = calculate_pnl(revenue, costs, inputs)
    cashflow = calculate_cashflow(pnl, inputs)
    unit_economics = calculate_unit_economics(revenue, users, costs, inputs)
    key_metrics = calculate_key_metrics(revenue, costs, pnl, inputs)
    scenarios = calculate_all_scenarios(inputs)
    
    return {
        "users": users,
        "revenue": revenue,
        "costs": costs,
        "pnl": pnl,
        "cashflow": cashflow,
        "unit_economics": unit_economics,
        "key_metrics": key_metrics,
        "scenarios": scenarios
    }

@api_router.post("/calculate/revenue")
async def calculate_revenue_only(inputs: FinancialInputs):
    """Calculate revenue projections"""
    users = calculate_monthly_users(inputs)
    revenue = calculate_revenue(inputs, users)
    return {"users": users, "revenue": revenue}

@api_router.post("/calculate/costs")
async def calculate_costs_only(inputs: FinancialInputs):
    """Calculate cost projections"""
    costs = calculate_costs(inputs)
    return {"costs": costs}

@api_router.post("/calculate/scenarios")
async def calculate_scenarios_only(inputs: FinancialInputs):
    """Calculate scenario comparison"""
    scenarios = calculate_all_scenarios(inputs)
    return {"scenarios": scenarios}

# Include the router in the main app
app.include_router(api_router)

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
