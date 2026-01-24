import React from 'react';
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Building, 
  Megaphone, 
  FileCheck,
  Wallet,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { formatCurrency } from '../../lib/utils';

function InputField({ label, helper, children }) {
  return (
    <div className="input-field">
      <Label className="input-label">{label}</Label>
      {children}
      {helper && <p className="input-helper">{helper}</p>}
    </div>
  );
}

function NumberInput({ value, onChange, prefix = '', suffix = '', min = 0, max, step = 1, ...props }) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">{prefix}</span>
      )}
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className={`${prefix ? 'pl-7' : ''} ${suffix ? 'pr-10' : ''} font-mono tabular-nums`}
        {...props}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">{suffix}</span>
      )}
    </div>
  );
}

function SliderInput({ value, onChange, min, max, step = 1, label }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-mono font-medium text-slate-900">{value}%</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
}

export function MasterInputsScreen() {
  const { inputs, updateInputs, updateSection, projections, loading } = useFinancial();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="master-inputs-screen">
      {/* Left Column - Inputs */}
      <div className="space-y-6">
        {/* Timeline & Planning */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <Calendar className="w-5 h-5 text-slate-600" />
              Timeline & Planning Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Revenue Start Month" helper="Month when revenue begins (1-12)">
                <Select
                  value={String(inputs.timeline.revenue_start_month)}
                  onValueChange={(v) => updateInputs('timeline', 'revenue_start_month', parseInt(v))}
                  data-testid="input-revenue-start-month"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <SelectItem key={m} value={String(m)}>Month {m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </InputField>
              
              <InputField label="Projection Years" helper="3 or 5 year projection">
                <Select
                  value={String(inputs.timeline.projection_years)}
                  onValueChange={(v) => updateInputs('timeline', 'projection_years', parseInt(v))}
                  data-testid="input-projection-years"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                  </SelectContent>
                </Select>
              </InputField>
            </div>
            
            <SliderInput
              label="Inflation Rate"
              value={inputs.timeline.inflation_rate}
              onChange={(v) => updateInputs('timeline', 'inflation_rate', v)}
              min={0}
              max={15}
              step={0.5}
            />
            
            <InputField label="Scenario" helper="Affects growth and cost multipliers">
              <Select
                value={inputs.timeline.scenario}
                onValueChange={(v) => updateInputs('timeline', 'scenario', v)}
                data-testid="input-scenario"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative (0.7x growth, 1.2x cost)</SelectItem>
                  <SelectItem value="base">Base (1.0x)</SelectItem>
                  <SelectItem value="aggressive">Aggressive (1.4x growth, 0.9x cost)</SelectItem>
                </SelectContent>
              </Select>
            </InputField>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <Users className="w-5 h-5 text-slate-600" />
              User Growth (End of Year)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-3 block">Artists</Label>
              <div className="grid grid-cols-5 gap-2">
                {['y1', 'y2', 'y3', 'y4', 'y5'].map((year, idx) => (
                  <InputField key={year} label={`Y${idx + 1}`}>
                    <NumberInput
                      value={inputs.user_growth[`artists_${year}`]}
                      onChange={(v) => updateInputs('user_growth', `artists_${year}`, v)}
                      data-testid={`input-artists-${year}`}
                    />
                  </InputField>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-3 block">Casting Directors</Label>
              <div className="grid grid-cols-5 gap-2">
                {['y1', 'y2', 'y3', 'y4', 'y5'].map((year, idx) => (
                  <InputField key={year} label={`Y${idx + 1}`}>
                    <NumberInput
                      value={inputs.user_growth[`cds_${year}`]}
                      onChange={(v) => updateInputs('user_growth', `cds_${year}`, v)}
                      data-testid={`input-cds-${year}`}
                    />
                  </InputField>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monetization - Artists */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <CreditCard className="w-5 h-5 text-slate-600" />
              Artist Monetization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <InputField label="Premium Price" helper="Monthly subscription">
                <NumberInput
                  value={inputs.artist_monetization.premium_price}
                  onChange={(v) => updateInputs('artist_monetization', 'premium_price', v)}
                  prefix="₹"
                  data-testid="input-artist-premium-price"
                />
              </InputField>
              
              <InputField label="Conversion %" helper="Free to premium">
                <NumberInput
                  value={inputs.artist_monetization.conversion_rate}
                  onChange={(v) => updateInputs('artist_monetization', 'conversion_rate', v)}
                  suffix="%"
                  step={0.5}
                  max={100}
                  data-testid="input-artist-conversion"
                />
              </InputField>
              
              <InputField label="Churn %" helper="Monthly churn">
                <NumberInput
                  value={inputs.artist_monetization.churn_rate}
                  onChange={(v) => updateInputs('artist_monetization', 'churn_rate', v)}
                  suffix="%"
                  step={0.5}
                  max={100}
                  data-testid="input-artist-churn"
                />
              </InputField>
            </div>
          </CardContent>
        </Card>

        {/* Monetization - CDs */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <CreditCard className="w-5 h-5 text-slate-600" />
              Casting Director Monetization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <InputField label="Premium Price" helper="Monthly subscription">
                <NumberInput
                  value={inputs.cd_monetization.premium_price}
                  onChange={(v) => updateInputs('cd_monetization', 'premium_price', v)}
                  prefix="₹"
                  data-testid="input-cd-premium-price"
                />
              </InputField>
              
              <InputField label="Conversion %" helper="Free to premium">
                <NumberInput
                  value={inputs.cd_monetization.conversion_rate}
                  onChange={(v) => updateInputs('cd_monetization', 'conversion_rate', v)}
                  suffix="%"
                  step={0.5}
                  max={100}
                  data-testid="input-cd-conversion"
                />
              </InputField>
              
              <InputField label="Churn %" helper="Monthly churn">
                <NumberInput
                  value={inputs.cd_monetization.churn_rate}
                  onChange={(v) => updateInputs('cd_monetization', 'churn_rate', v)}
                  suffix="%"
                  step={0.5}
                  max={100}
                  data-testid="input-cd-churn"
                />
              </InputField>
            </div>
          </CardContent>
        </Card>

        {/* Transactional */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <TrendingUp className="w-5 h-5 text-slate-600" />
              Transactional Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Avg Jobs/CD/Month" helper="Average jobs posted">
                <NumberInput
                  value={inputs.transactional.avg_jobs_per_cd}
                  onChange={(v) => updateInputs('transactional', 'avg_jobs_per_cd', v)}
                  step={0.5}
                  data-testid="input-avg-jobs"
                />
              </InputField>
              
              <InputField label="Job Boost Price" helper="Per boost">
                <NumberInput
                  value={inputs.transactional.job_boost_price}
                  onChange={(v) => updateInputs('transactional', 'job_boost_price', v)}
                  prefix="₹"
                  data-testid="input-boost-price"
                />
              </InputField>
            </div>
            
            <SliderInput
              label="% Jobs Boosted"
              value={inputs.transactional.boost_percentage}
              onChange={(v) => updateInputs('transactional', 'boost_percentage', v)}
              min={0}
              max={100}
              step={5}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Escrow Fee %" helper="Platform fee on escrow">
                <NumberInput
                  value={inputs.transactional.escrow_fee_percentage}
                  onChange={(v) => updateInputs('transactional', 'escrow_fee_percentage', v)}
                  suffix="%"
                  step={0.5}
                  max={20}
                  data-testid="input-escrow-fee"
                />
              </InputField>
              
              <InputField label="Escrow Starts Year" helper="When escrow is enabled">
                <Select
                  value={String(inputs.transactional.escrow_enabled_year)}
                  onValueChange={(v) => updateInputs('transactional', 'escrow_enabled_year', parseInt(v))}
                  data-testid="input-escrow-year"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5].map(y => (
                      <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </InputField>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - More Inputs */}
      <div className="space-y-6">
        {/* Team Costs */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <Users className="w-5 h-5 text-slate-600" />
              Team Costs (Monthly)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Founder Stipend" helper="Per founder/month">
                <NumberInput
                  value={inputs.team_costs.founder_stipend}
                  onChange={(v) => updateInputs('team_costs', 'founder_stipend', v)}
                  prefix="₹"
                  data-testid="input-founder-stipend"
                />
              </InputField>
              
              <InputField label="Founder Count">
                <NumberInput
                  value={inputs.team_costs.founder_count}
                  onChange={(v) => updateInputs('team_costs', 'founder_count', v)}
                  min={1}
                  max={5}
                  data-testid="input-founder-count"
                />
              </InputField>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Intern Salary" helper="Per intern/month">
                <NumberInput
                  value={inputs.team_costs.intern_salary}
                  onChange={(v) => updateInputs('team_costs', 'intern_salary', v)}
                  prefix="₹"
                  data-testid="input-intern-salary"
                />
              </InputField>
              
              <InputField label="Intern Count">
                <NumberInput
                  value={inputs.team_costs.interns_count}
                  onChange={(v) => updateInputs('team_costs', 'interns_count', v)}
                  min={0}
                  max={20}
                  data-testid="input-intern-count"
                />
              </InputField>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Full-time Salary" helper="Per employee/month">
                <NumberInput
                  value={inputs.team_costs.fulltime_salary}
                  onChange={(v) => updateInputs('team_costs', 'fulltime_salary', v)}
                  prefix="₹"
                  data-testid="input-fulltime-salary"
                />
              </InputField>
              
              <InputField label="Full-time Start Year">
                <Select
                  value={String(inputs.team_costs.fulltime_start_year)}
                  onValueChange={(v) => updateInputs('team_costs', 'fulltime_start_year', parseInt(v))}
                  data-testid="input-fulltime-start"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5].map(y => (
                      <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </InputField>
            </div>
            
            <SliderInput
              label="ESOP Allocation"
              value={inputs.team_costs.esop_percentage}
              onChange={(v) => updateInputs('team_costs', 'esop_percentage', v)}
              min={0}
              max={25}
              step={1}
            />
          </CardContent>
        </Card>

        {/* Infrastructure */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <Building className="w-5 h-5 text-slate-600" />
              Infrastructure (Monthly)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Hosting" helper="Cloud hosting costs">
                <NumberInput
                  value={inputs.infra_costs.hosting}
                  onChange={(v) => updateInputs('infra_costs', 'hosting', v)}
                  prefix="₹"
                  data-testid="input-hosting"
                />
              </InputField>
              
              <InputField label="Storage" helper="Data storage">
                <NumberInput
                  value={inputs.infra_costs.storage}
                  onChange={(v) => updateInputs('infra_costs', 'storage', v)}
                  prefix="₹"
                  data-testid="input-storage"
                />
              </InputField>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="AI Compute" helper="ML/AI costs (when enabled)">
                <NumberInput
                  value={inputs.infra_costs.ai_compute_enabled}
                  onChange={(v) => updateInputs('infra_costs', 'ai_compute_enabled', v)}
                  prefix="₹"
                  data-testid="input-ai-compute"
                />
              </InputField>
              
              <InputField label="AI Starts Year">
                <Select
                  value={String(inputs.infra_costs.ai_enabled_year)}
                  onValueChange={(v) => updateInputs('infra_costs', 'ai_enabled_year', parseInt(v))}
                  data-testid="input-ai-year"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5].map(y => (
                      <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </InputField>
            </div>
            
            <InputField label="SaaS Tools" helper="Software subscriptions">
              <NumberInput
                value={inputs.infra_costs.saas_tools}
                onChange={(v) => updateInputs('infra_costs', 'saas_tools', v)}
                prefix="₹"
                data-testid="input-saas"
              />
            </InputField>
          </CardContent>
        </Card>

        {/* Marketing */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <Megaphone className="w-5 h-5 text-slate-600" />
              Marketing (Monthly)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <InputField label="Organic" helper="Content, SEO">
                <NumberInput
                  value={inputs.marketing_costs.organic}
                  onChange={(v) => updateInputs('marketing_costs', 'organic', v)}
                  prefix="₹"
                  data-testid="input-organic"
                />
              </InputField>
              
              <InputField label="Paid" helper="Ads spend">
                <NumberInput
                  value={inputs.marketing_costs.paid}
                  onChange={(v) => updateInputs('marketing_costs', 'paid', v)}
                  prefix="₹"
                  data-testid="input-paid"
                />
              </InputField>
              
              <InputField label="Influencer" helper="Collaborations">
                <NumberInput
                  value={inputs.marketing_costs.influencer}
                  onChange={(v) => updateInputs('marketing_costs', 'influencer', v)}
                  prefix="₹"
                  data-testid="input-influencer"
                />
              </InputField>
            </div>
          </CardContent>
        </Card>

        {/* Admin */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <FileCheck className="w-5 h-5 text-slate-600" />
              Admin & Compliance (Monthly)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <InputField label="Legal">
                <NumberInput
                  value={inputs.admin_costs.legal}
                  onChange={(v) => updateInputs('admin_costs', 'legal', v)}
                  prefix="₹"
                  data-testid="input-legal"
                />
              </InputField>
              
              <InputField label="Compliance">
                <NumberInput
                  value={inputs.admin_costs.compliance}
                  onChange={(v) => updateInputs('admin_costs', 'compliance', v)}
                  prefix="₹"
                  data-testid="input-compliance"
                />
              </InputField>
              
              <InputField label="Accounting">
                <NumberInput
                  value={inputs.admin_costs.accounting}
                  onChange={(v) => updateInputs('admin_costs', 'accounting', v)}
                  prefix="₹"
                  data-testid="input-accounting"
                />
              </InputField>
            </div>
            
            <SliderInput
              label="Misc Buffer"
              value={inputs.admin_costs.misc_buffer_percentage}
              onChange={(v) => updateInputs('admin_costs', 'misc_buffer_percentage', v)}
              min={0}
              max={25}
              step={1}
            />
          </CardContent>
        </Card>

        {/* Tax & Compliance */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <FileCheck className="w-5 h-5 text-slate-600" />
              Tax & Compliance (India)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Corporate Tax %" helper="Standard: 25%">
                <NumberInput
                  value={inputs.tax_inputs.corporate_tax_rate}
                  onChange={(v) => updateInputs('tax_inputs', 'corporate_tax_rate', v)}
                  suffix="%"
                  max={40}
                  data-testid="input-corp-tax"
                />
              </InputField>
              
              <InputField label="GST Rate %" helper="Standard: 18%">
                <NumberInput
                  value={inputs.tax_inputs.gst_rate}
                  onChange={(v) => updateInputs('tax_inputs', 'gst_rate', v)}
                  suffix="%"
                  max={28}
                  data-testid="input-gst"
                />
              </InputField>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="TDS Rate %">
                <NumberInput
                  value={inputs.tax_inputs.tds_rate}
                  onChange={(v) => updateInputs('tax_inputs', 'tds_rate', v)}
                  suffix="%"
                  max={30}
                  data-testid="input-tds"
                />
              </InputField>
              
              <InputField label="Depreciation %" helper="Annual depreciation">
                <NumberInput
                  value={inputs.tax_inputs.depreciation_rate}
                  onChange={(v) => updateInputs('tax_inputs', 'depreciation_rate', v)}
                  suffix="%"
                  max={40}
                  data-testid="input-depreciation"
                />
              </InputField>
            </div>
            
            <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">GST Applicable</Label>
                <p className="text-xs text-slate-500">Enable GST calculations</p>
              </div>
              <Switch
                checked={inputs.tax_inputs.gst_applicable}
                onCheckedChange={(v) => updateInputs('tax_inputs', 'gst_applicable', v)}
                data-testid="input-gst-toggle"
              />
            </div>
          </CardContent>
        </Card>

        {/* Funding */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <Wallet className="w-5 h-5 text-slate-600" />
              Funding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InputField label="Seed Funding" helper="Initial capital raised">
              <NumberInput
                value={inputs.funding.seed_funding}
                onChange={(v) => updateInputs('funding', 'seed_funding', v)}
                prefix="₹"
                data-testid="input-seed-funding"
              />
            </InputField>
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Series A Year">
                <Select
                  value={String(inputs.funding.series_a_year)}
                  onValueChange={(v) => updateInputs('funding', 'series_a_year', parseInt(v))}
                  data-testid="input-series-a-year"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2,3,4,5].map(y => (
                      <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </InputField>
              
              <InputField label="Series A Amount">
                <NumberInput
                  value={inputs.funding.series_a_amount}
                  onChange={(v) => updateInputs('funding', 'series_a_amount', v)}
                  prefix="₹"
                  data-testid="input-series-a-amount"
                />
              </InputField>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
