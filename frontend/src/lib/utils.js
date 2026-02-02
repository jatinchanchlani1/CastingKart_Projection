import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format currency in INR
export function formatCurrency(value, compact = false) {
  if (value === null || value === undefined) return "₹0";
  
  const absValue = Math.abs(value);
  const isNegative = value < 0;
  
  let formatted;
  
  if (compact) {
    if (absValue >= 10000000) {
      formatted = `₹${(absValue / 10000000).toFixed(2)}Cr`;
    } else if (absValue >= 100000) {
      formatted = `₹${(absValue / 100000).toFixed(2)}L`;
    } else if (absValue >= 1000) {
      formatted = `₹${(absValue / 1000).toFixed(1)}K`;
    } else {
      formatted = `₹${absValue.toFixed(0)}`;
    }
  } else {
    formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(absValue);
  }
  
  return isNegative ? `(${formatted})` : formatted;
}

// Format percentage
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return "0%";
  return `${value.toFixed(decimals)}%`;
}

// Format number with commas (Indian numbering system)
export function formatNumber(value) {
  if (value === null || value === undefined) return "0";
  return new Intl.NumberFormat('en-IN').format(value);
}

// Calculate growth rate
export function calculateGrowth(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

// Generate UUID
export function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Month names
export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Year labels
export const YEARS = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'];

// Chart colors
export const CHART_COLORS = {
  revenue: '#0F172A',
  cost: '#F43F5E',
  profit: '#10B981',
  cash: '#2563EB',
  artistPremium: '#0F172A',
  cdPremium: '#3B82F6',
  boosts: '#8B5CF6',
  directInvites: '#14B8A6',
  auditions: '#F97316',
  ads: '#EAB308',
  otherIncome: '#F59E0B',
  team: '#0F172A',
  digitalInfra: '#3B82F6',
  physicalInfra: '#6366F1',
  hardware: '#8B5CF6',
  marketing: '#EC4899',
  travel: '#14B8A6',
  admin: '#F59E0B',
  other: '#64748B',
  platformVariable: '#0EA5E9',
};

// Scenario colors
export const SCENARIO_COLORS = {
  conservative: '#F59E0B',
  base: '#3B82F6',
  aggressive: '#10B981',
};

// Default inputs structure
export const DEFAULT_INPUTS = {
  timeline: {
    revenue_start_month: 7,
    projection_years: 5,
    inflation_rate: 6.0,
    scenario: "base"
  },
  user_growth: {
    artists_y1: 5000,
    artists_y2: 25000,
    artists_y3: 75000,
    artists_y4: 150000,
    artists_y5: 300000,
    cds_y1: 200,
    cds_y2: 800,
    cds_y3: 2000,
    cds_y4: 5000,
    cds_y5: 12000
  },
  artist_monetization: {
    premium_price: 299,
    conversion_rate: 5.0,
    churn_rate: 8.0
  },
  cd_monetization: {
    premium_price: 999,
    conversion_rate: 15.0,
    churn_rate: 5.0
  },
  transactional: {
    avg_jobs_per_cd: 3.0,
    job_boost_price: 199,
    boost_percentage: 20.0
  },
  plan_limits: {
    free_boosts_per_cd_per_month: 0,
    premium_boosts_per_cd_per_month: 10,
    free_invites_per_cd_per_month: 2,
    premium_invites_per_cd_per_month: 20,
    free_auditions_per_cd_per_month: 1,
    premium_auditions_per_cd_per_month: 10
  },
  monetized_actions: {
    boost_price: 99,
    invite_credit_price: 49,
    audition_credit_price: 149,
    ads_revenue_per_free_user_per_month: 5,
    ads_revenue_per_premium_user_per_month: 2
  },
  volume_assumptions: {
    avg_jobs_per_cd_per_month: 3.0,
    avg_applications_per_job: 30,
    boost_rate_free_pct: 5.0,
    boost_rate_premium_pct: 20.0,
    direct_invites_free_per_cd_per_month: 2.0,
    direct_invites_premium_per_cd_per_month: 8.0,
    auditions_free_per_cd_per_month: 1.0,
    auditions_premium_per_cd_per_month: 4.0,
    artist_uploads_per_month: 0.2,
    notifications_per_user_per_month: 5.0
  },
  unit_costs: {
    payment_processing_pct: 2.0,
    ai_tagging_cost_per_upload: 2.0,
    ai_search_cost_per_premium_user_per_month: 5.0,
    audition_video_cost_per_request: 10.0,
    notification_cost_per_message: 0.5,
    ad_serving_cost_pct: 10.0
  },
  team_costs: {
    members: [
      { id: generateId(), name: "Founder 1", role: "founder", monthly_salary: 0, start_month: 1, start_year: 1 },
      { id: generateId(), name: "Founder 2", role: "founder", monthly_salary: 0, start_month: 1, start_year: 1 },
      { id: generateId(), name: "Dev Intern", role: "intern", monthly_salary: 15000, start_month: 1, start_year: 1 },
      { id: generateId(), name: "Design Intern", role: "intern", monthly_salary: 15000, start_month: 1, start_year: 1 },
    ],
    esop_percentage: 10.0
  },
  physical_infra: {
    office_rent: 0,
    electricity: 2000,
    internet: 2000,
    maintenance: 1000,
    office_start_month: 1,
    office_start_year: 2
  },
  digital_infra: {
    hosting: 5000,
    storage: 2000,
    ai_compute: 0,
    ai_enabled_year: 2,
    ai_compute_enabled: 10000,
    saas_tools: 8000
  },
  hardware_costs: {
    items: [
      { id: generateId(), name: "Laptop", unit_cost: 60000, quantity: 2, purchase_month: 1, purchase_year: 1 },
      { id: generateId(), name: "Office Chair", unit_cost: 8000, quantity: 4, purchase_month: 1, purchase_year: 2 },
      { id: generateId(), name: "Desk/Table", unit_cost: 5000, quantity: 4, purchase_month: 1, purchase_year: 2 },
      { id: generateId(), name: "Stationery", unit_cost: 2000, quantity: 1, purchase_month: 1, purchase_year: 1 },
    ]
  },
  marketing_costs: {
    organic: 10000,
    paid: 20000,
    influencer: 15000
  },
  admin_costs: {
    legal: 10000,
    compliance: 5000,
    accounting: 8000,
    misc_buffer_percentage: 10.0
  },
  travel_costs: {
    items: [
      { id: generateId(), name: "Local Travel", estimated_monthly: 5000, start_month: 1, start_year: 1, is_recurring: true },
      { id: generateId(), name: "Client Meetings", estimated_monthly: 10000, start_month: 1, start_year: 2, is_recurring: true },
    ]
  },
  other_expenses: {
    items: [
      { id: generateId(), name: "Miscellaneous", amount: 5000, start_month: 1, start_year: 1, is_recurring: true },
    ]
  },
  other_income: {
    items: [
      { id: generateId(), name: "Google Ads Revenue", amount: 0, start_month: 7, start_year: 2, is_recurring: true },
    ]
  },
  tax_inputs: {
    corporate_tax_rate: 25.0,
    gst_applicable: true,
    gst_rate: 18.0,
    tds_rate: 10.0,
    depreciation_rate: 15.0
  },
  funding: {
    rounds: [
      { id: generateId(), name: "Seed Round", amount: 5000000, month: 1, year: 1, investor: "Angel Investors", notes: "Initial capital" },
      { id: generateId(), name: "Series A", amount: 25000000, month: 1, year: 3, investor: "VC Fund", notes: "Growth funding" },
    ]
  }
};
