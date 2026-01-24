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
  escrow: '#10B981',
  team: '#0F172A',
  infrastructure: '#3B82F6',
  marketing: '#8B5CF6',
  admin: '#F59E0B',
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
    boost_percentage: 20.0,
    escrow_fee_percentage: 5.0,
    escrow_enabled_year: 3
  },
  team_costs: {
    founder_stipend: 0,
    founder_count: 2,
    interns_count: 2,
    intern_salary: 15000,
    fulltime_start_year: 2,
    fulltime_count_y2: 2,
    fulltime_count_y3: 5,
    fulltime_count_y4: 10,
    fulltime_count_y5: 20,
    fulltime_salary: 50000,
    esop_percentage: 10.0
  },
  infra_costs: {
    hosting: 5000,
    storage: 2000,
    ai_compute: 0,
    ai_enabled_year: 2,
    ai_compute_enabled: 10000,
    saas_tools: 8000
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
  tax_inputs: {
    corporate_tax_rate: 25.0,
    gst_applicable: true,
    gst_rate: 18.0,
    tds_rate: 10.0,
    depreciation_rate: 15.0
  },
  funding: {
    seed_funding: 5000000,
    series_a_year: 3,
    series_a_amount: 25000000
  }
};
