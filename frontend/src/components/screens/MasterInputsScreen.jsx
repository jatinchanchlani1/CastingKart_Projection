import React from 'react';
import { 
  Calendar, Users, CreditCard, Building, Megaphone, FileCheck,
  Wallet, TrendingUp, Plus, Trash2, Laptop, Car, MoreHorizontal, DollarSign
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { generateId } from '../../lib/utils';

function InputField({ label, helper, children }) {
  return (
    <div className="input-field">
      <Label className="input-label">{label}</Label>
      {children}
      {helper && <p className="input-helper">{helper}</p>}
    </div>
  );
}

function NumberInput({ value, onChange, prefix = '', suffix = '', min = 0, max, step = 1, className = '', ...props }) {
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
        className={`${prefix ? 'pl-7' : ''} ${suffix ? 'pr-10' : ''} font-mono tabular-nums ${className}`}
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

// Dynamic Team Members Section
function TeamMembersSection({ members, esopPercentage, onUpdate }) {
  const addMember = (role) => {
    const newMember = {
      id: generateId(),
      name: role === 'founder' ? `Founder ${members.filter(m => m.role === 'founder').length + 1}` :
            role === 'intern' ? `Intern ${members.filter(m => m.role === 'intern').length + 1}` :
            role === 'employee' ? `Employee ${members.filter(m => m.role === 'employee').length + 1}` :
            `Other ${members.filter(m => m.role === 'other').length + 1}`,
      role,
      monthly_salary: role === 'founder' ? 0 : role === 'intern' ? 15000 : 50000,
      start_month: 1,
      start_year: 1
    };
    onUpdate('members', [...members, newMember]);
  };

  const updateMember = (id, updates) => {
    const updated = members.map(m => m.id === id ? { ...m, ...updates } : m);
    onUpdate('members', updated);
  };

  const removeMember = (id) => {
    onUpdate('members', members.filter(m => m.id !== id));
  };

  const roleGroups = {
    founder: members.filter(m => m.role === 'founder'),
    intern: members.filter(m => m.role === 'intern'),
    employee: members.filter(m => m.role === 'employee'),
    other: members.filter(m => m.role === 'other')
  };

  const renderMemberRow = (member) => (
    <div key={member.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
      <Input
        value={member.name}
        onChange={(e) => updateMember(member.id, { name: e.target.value })}
        className="flex-1 h-8 text-sm"
        placeholder="Name"
      />
      <NumberInput
        value={member.monthly_salary}
        onChange={(v) => updateMember(member.id, { monthly_salary: v })}
        prefix="₹"
        className="w-28 h-8 text-sm"
      />
      <Select
        value={`${member.start_year}-${member.start_month}`}
        onValueChange={(v) => {
          const [year, month] = v.split('-').map(Number);
          updateMember(member.id, { start_year: year, start_month: month });
        }}
      >
        <SelectTrigger className="w-24 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[1,2,3,4,5].map(y => 
            [1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
              <SelectItem key={`${y}-${m}`} value={`${y}-${m}`}>Y{y} M{m}</SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="sm" onClick={() => removeMember(member.id)} className="h-8 w-8 p-0">
        <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-500" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">Add team members with monthly salary and the month/year they start.</p>
      {/* Founders */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-semibold text-slate-700">Founders</Label>
          <Button variant="outline" size="sm" onClick={() => addMember('founder')} className="h-7 text-xs">
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {roleGroups.founder.map(renderMemberRow)}
          {roleGroups.founder.length === 0 && <p className="text-xs text-slate-400 italic">No founders added</p>}
        </div>
      </div>

      {/* Interns */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-semibold text-slate-700">Interns</Label>
          <Button variant="outline" size="sm" onClick={() => addMember('intern')} className="h-7 text-xs">
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {roleGroups.intern.map(renderMemberRow)}
          {roleGroups.intern.length === 0 && <p className="text-xs text-slate-400 italic">No interns added</p>}
        </div>
      </div>

      {/* Full-time Employees */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-semibold text-slate-700">Full-time Employees</Label>
          <Button variant="outline" size="sm" onClick={() => addMember('employee')} className="h-7 text-xs">
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {roleGroups.employee.map(renderMemberRow)}
          {roleGroups.employee.length === 0 && <p className="text-xs text-slate-400 italic">No employees added</p>}
        </div>
      </div>

      {/* Others */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-semibold text-slate-700">Others (Consultants, etc.)</Label>
          <Button variant="outline" size="sm" onClick={() => addMember('other')} className="h-7 text-xs">
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {roleGroups.other.map(renderMemberRow)}
          {roleGroups.other.length === 0 && <p className="text-xs text-slate-400 italic">No others added</p>}
        </div>
      </div>

      {/* ESOP */}
      <SliderInput
        label="ESOP Allocation"
        value={esopPercentage}
        onChange={(v) => onUpdate('esop_percentage', v)}
        min={0}
        max={25}
        step={1}
      />
      <p className="text-xs text-slate-500">Percent of team salary added as ESOP cost.</p>
    </div>
  );
}

// Dynamic Items Section (for Hardware, Travel, Expenses, Income)
function DynamicItemsSection({ items, onUpdate, itemType, fields }) {
  const addItem = () => {
    const defaults = {
      hardware: { name: "New Item", unit_cost: 10000, quantity: 1, purchase_month: 1, purchase_year: 1 },
      travel: { name: "New Travel", estimated_monthly: 5000, start_month: 1, start_year: 1, is_recurring: true },
      expense: { name: "New Expense", amount: 5000, start_month: 1, start_year: 1, is_recurring: true },
      income: { name: "New Income", amount: 0, start_month: 1, start_year: 1, is_recurring: true },
      funding: { name: "New Round", amount: 1000000, month: 1, year: 1, investor: "", notes: "" }
    };
    onUpdate([...items, { id: generateId(), ...defaults[itemType] }]);
  };

  const updateItem = (id, updates) => {
    const updated = items.map(item => item.id === id ? { ...item, ...updates } : item);
    onUpdate(updated);
  };

  const removeItem = (id) => {
    onUpdate(items.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg flex-wrap">
          <Input
            value={item.name}
            onChange={(e) => updateItem(item.id, { name: e.target.value })}
            className="flex-1 min-w-32 h-8 text-sm"
            placeholder="Name"
          />
          
          {fields.includes('unit_cost') && (
            <NumberInput
              value={item.unit_cost}
              onChange={(v) => updateItem(item.id, { unit_cost: v })}
              prefix="₹"
              className="w-24 h-8 text-sm"
            />
          )}
          
          {fields.includes('quantity') && (
            <NumberInput
              value={item.quantity}
              onChange={(v) => updateItem(item.id, { quantity: v })}
              className="w-16 h-8 text-sm"
              min={1}
            />
          )}
          
          {fields.includes('amount') && (
            <NumberInput
              value={item.amount}
              onChange={(v) => updateItem(item.id, { amount: v })}
              prefix="₹"
              className="w-28 h-8 text-sm"
            />
          )}
          
          {fields.includes('estimated_monthly') && (
            <NumberInput
              value={item.estimated_monthly}
              onChange={(v) => updateItem(item.id, { estimated_monthly: v })}
              prefix="₹"
              className="w-28 h-8 text-sm"
            />
          )}
          
          {fields.includes('is_recurring') && (
            <Select
              value={item.is_recurring ? 'recurring' : 'onetime'}
              onValueChange={(v) => updateItem(item.id, { is_recurring: v === 'recurring' })}
            >
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recurring">Monthly</SelectItem>
                <SelectItem value="onetime">One-time</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {fields.includes('purchase_month') && (
            <Select
              value={`${item.purchase_year}-${item.purchase_month}`}
              onValueChange={(v) => {
                const [year, month] = v.split('-').map(Number);
                updateItem(item.id, { purchase_year: year, purchase_month: month });
              }}
            >
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5].map(y => 
                  [1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <SelectItem key={`${y}-${m}`} value={`${y}-${m}`}>Y{y} M{m}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
          
          {fields.includes('start_month') && (
            <Select
              value={`${item.start_year || item.year}-${item.start_month || item.month}`}
              onValueChange={(v) => {
                const [year, month] = v.split('-').map(Number);
                // Handle both start_year/start_month and year/month field names
                if (item.start_year !== undefined) {
                  updateItem(item.id, { start_year: year, start_month: month });
                } else {
                  updateItem(item.id, { year: year, month: month });
                }
              }}
            >
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5].map(y => 
                  [1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <SelectItem key={`${y}-${m}`} value={`${y}-${m}`}>Y{y} M{m}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
          
          {fields.includes('investor') && (
            <Input
              value={item.investor || ''}
              onChange={(e) => updateItem(item.id, { investor: e.target.value })}
              className="w-28 h-8 text-sm"
              placeholder="Investor"
            />
          )}
          
          <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="h-8 w-8 p-0">
            <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-500" />
          </Button>
        </div>
      ))}
      
      <Button variant="outline" size="sm" onClick={addItem} className="w-full h-8 text-xs">
        <Plus className="w-3 h-3 mr-1" /> Add Item
      </Button>
    </div>
  );
}

export function MasterInputsScreen() {
  const { inputs, updateInputs, updateSection } = useFinancial();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="master-inputs-screen">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Timeline & Planning */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <Calendar className="w-5 h-5 text-slate-600" />
              Timeline & Planning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Revenue Start Month" helper="When revenue begins">
                <Select
                  value={String(inputs.timeline.revenue_start_month)}
                  onValueChange={(v) => updateInputs('timeline', 'revenue_start_month', parseInt(v))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <SelectItem key={m} value={String(m)}>Month {m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </InputField>
              
              <InputField label="Scenario" helper="Adjusts growth, conversion, and cost assumptions">
                <Select
                  value={inputs.timeline.scenario}
                  onValueChange={(v) => updateInputs('timeline', 'scenario', v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="base">Base</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </InputField>
            </div>
            
            <SliderInput
              label="Inflation Rate"
              value={inputs.timeline.inflation_rate}
              onChange={(v) => updateInputs('timeline', 'inflation_rate', v)}
              min={0} max={15} step={0.5}
            />
            <p className="text-xs text-slate-500">Annual cost inflation applied to salaries and operating costs.</p>
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
                  <InputField key={year} label={`Y${idx + 1}`} helper="End-of-year artist count">
                    <NumberInput
                      value={inputs.user_growth[`artists_${year}`]}
                      onChange={(v) => updateInputs('user_growth', `artists_${year}`, v)}
                    />
                  </InputField>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-3 block">Casting Directors</Label>
              <div className="grid grid-cols-5 gap-2">
                {['y1', 'y2', 'y3', 'y4', 'y5'].map((year, idx) => (
                  <InputField key={year} label={`Y${idx + 1}`} helper="End-of-year CD count">
                    <NumberInput
                      value={inputs.user_growth[`cds_${year}`]}
                      onChange={(v) => updateInputs('user_growth', `cds_${year}`, v)}
                    />
                  </InputField>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monetization */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <CreditCard className="w-5 h-5 text-slate-600" />
              Monetization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label className="text-sm font-semibold text-slate-700">Artist Premium</Label>
            <div className="grid grid-cols-3 gap-4">
              <InputField label="Price/month" helper="Monthly subscription price for artists">
                <NumberInput value={inputs.artist_monetization.premium_price} onChange={(v) => updateInputs('artist_monetization', 'premium_price', v)} prefix="₹" />
              </InputField>
              <InputField label="Conversion %" helper="Percent of artists who upgrade to premium">
                <NumberInput value={inputs.artist_monetization.conversion_rate} onChange={(v) => updateInputs('artist_monetization', 'conversion_rate', v)} suffix="%" max={100} step={0.5} />
              </InputField>
              <InputField label="Churn %" helper="Monthly premium churn rate for artists">
                <NumberInput value={inputs.artist_monetization.churn_rate} onChange={(v) => updateInputs('artist_monetization', 'churn_rate', v)} suffix="%" max={100} step={0.5} />
              </InputField>
            </div>
            
            <Label className="text-sm font-semibold text-slate-700">CD Premium</Label>
            <div className="grid grid-cols-3 gap-4">
              <InputField label="Price/month" helper="Monthly subscription price for CDs">
                <NumberInput value={inputs.cd_monetization.premium_price} onChange={(v) => updateInputs('cd_monetization', 'premium_price', v)} prefix="₹" />
              </InputField>
              <InputField label="Conversion %" helper="Percent of CDs who upgrade to premium">
                <NumberInput value={inputs.cd_monetization.conversion_rate} onChange={(v) => updateInputs('cd_monetization', 'conversion_rate', v)} suffix="%" max={100} step={0.5} />
              </InputField>
              <InputField label="Churn %" helper="Monthly premium churn rate for CDs">
                <NumberInput value={inputs.cd_monetization.churn_rate} onChange={(v) => updateInputs('cd_monetization', 'churn_rate', v)} suffix="%" max={100} step={0.5} />
              </InputField>
            </div>
            
          </CardContent>
        </Card>

        {/* Plans & Limits */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <DollarSign className="w-5 h-5 text-slate-600" />
              Plans & Limits (Per CD/Month)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label className="text-sm font-semibold text-slate-700">Free Tier Limits</Label>
            <div className="grid grid-cols-3 gap-4">
              <InputField label="Free Boosts" helper="Free boosts included per CD per month">
                <NumberInput value={inputs.plan_limits.free_boosts_per_cd_per_month} onChange={(v) => updateInputs('plan_limits', 'free_boosts_per_cd_per_month', v)} />
              </InputField>
              <InputField label="Free Invites" helper="Free direct invites per CD per month">
                <NumberInput value={inputs.plan_limits.free_invites_per_cd_per_month} onChange={(v) => updateInputs('plan_limits', 'free_invites_per_cd_per_month', v)} />
              </InputField>
              <InputField label="Free Auditions" helper="Free audition requests per CD per month">
                <NumberInput value={inputs.plan_limits.free_auditions_per_cd_per_month} onChange={(v) => updateInputs('plan_limits', 'free_auditions_per_cd_per_month', v)} />
              </InputField>
            </div>

            <Label className="text-sm font-semibold text-slate-700">Premium Tier Limits</Label>
            <div className="grid grid-cols-3 gap-4">
              <InputField label="Premium Boosts" helper="Included boosts for premium CDs per month">
                <NumberInput value={inputs.plan_limits.premium_boosts_per_cd_per_month} onChange={(v) => updateInputs('plan_limits', 'premium_boosts_per_cd_per_month', v)} />
              </InputField>
              <InputField label="Premium Invites" helper="Included direct invites for premium CDs">
                <NumberInput value={inputs.plan_limits.premium_invites_per_cd_per_month} onChange={(v) => updateInputs('plan_limits', 'premium_invites_per_cd_per_month', v)} />
              </InputField>
              <InputField label="Premium Auditions" helper="Included audition requests for premium CDs">
                <NumberInput value={inputs.plan_limits.premium_auditions_per_cd_per_month} onChange={(v) => updateInputs('plan_limits', 'premium_auditions_per_cd_per_month', v)} />
              </InputField>
            </div>
          </CardContent>
        </Card>

        {/* Monetized Actions */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <TrendingUp className="w-5 h-5 text-slate-600" />
              Monetized Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <InputField label="Boost Price" helper="Price per paid boost">
                <NumberInput value={inputs.monetized_actions.boost_price} onChange={(v) => updateInputs('monetized_actions', 'boost_price', v)} prefix="₹" />
              </InputField>
              <InputField label="Invite Credit Price" helper="Price per extra invite credit">
                <NumberInput value={inputs.monetized_actions.invite_credit_price} onChange={(v) => updateInputs('monetized_actions', 'invite_credit_price', v)} prefix="₹" />
              </InputField>
              <InputField label="Audition Credit Price" helper="Price per extra audition credit">
                <NumberInput value={inputs.monetized_actions.audition_credit_price} onChange={(v) => updateInputs('monetized_actions', 'audition_credit_price', v)} prefix="₹" />
              </InputField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Ads Revenue/Free User/Month" helper="Avg ad revenue per free user">
                <NumberInput value={inputs.monetized_actions.ads_revenue_per_free_user_per_month} onChange={(v) => updateInputs('monetized_actions', 'ads_revenue_per_free_user_per_month', v)} prefix="₹" step={0.5} />
              </InputField>
              <InputField label="Ads Revenue/Premium User/Month" helper="Avg ad revenue per premium user">
                <NumberInput value={inputs.monetized_actions.ads_revenue_per_premium_user_per_month} onChange={(v) => updateInputs('monetized_actions', 'ads_revenue_per_premium_user_per_month', v)} prefix="₹" step={0.5} />
              </InputField>
            </div>
          </CardContent>
        </Card>

        {/* Volume Assumptions */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <Users className="w-5 h-5 text-slate-600" />
              Volume Assumptions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <InputField label="Jobs/CD/Month" helper="Average jobs posted per CD per month">
                <NumberInput value={inputs.volume_assumptions.avg_jobs_per_cd_per_month} onChange={(v) => updateInputs('volume_assumptions', 'avg_jobs_per_cd_per_month', v)} step={0.5} />
              </InputField>
              <InputField label="Applications/Job" helper="Average applicants per job">
                <NumberInput value={inputs.volume_assumptions.avg_applications_per_job} onChange={(v) => updateInputs('volume_assumptions', 'avg_applications_per_job', v)} />
              </InputField>
              <InputField label="Artist Uploads/Month" helper="Avg profile media uploads per artist">
                <NumberInput value={inputs.volume_assumptions.artist_uploads_per_month} onChange={(v) => updateInputs('volume_assumptions', 'artist_uploads_per_month', v)} step={0.05} />
              </InputField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Boost Rate (Free %)" helper="Percent of free CD jobs boosted">
                <NumberInput value={inputs.volume_assumptions.boost_rate_free_pct} onChange={(v) => updateInputs('volume_assumptions', 'boost_rate_free_pct', v)} suffix="%" step={1} />
              </InputField>
              <InputField label="Boost Rate (Premium %)" helper="Percent of premium CD jobs boosted">
                <NumberInput value={inputs.volume_assumptions.boost_rate_premium_pct} onChange={(v) => updateInputs('volume_assumptions', 'boost_rate_premium_pct', v)} suffix="%" step={1} />
              </InputField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Invites/CD/Month (Free)" helper="Avg direct invites by free CDs">
                <NumberInput value={inputs.volume_assumptions.direct_invites_free_per_cd_per_month} onChange={(v) => updateInputs('volume_assumptions', 'direct_invites_free_per_cd_per_month', v)} step={0.5} />
              </InputField>
              <InputField label="Invites/CD/Month (Premium)" helper="Avg direct invites by premium CDs">
                <NumberInput value={inputs.volume_assumptions.direct_invites_premium_per_cd_per_month} onChange={(v) => updateInputs('volume_assumptions', 'direct_invites_premium_per_cd_per_month', v)} step={0.5} />
              </InputField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Auditions/CD/Month (Free)" helper="Avg audition requests by free CDs">
                <NumberInput value={inputs.volume_assumptions.auditions_free_per_cd_per_month} onChange={(v) => updateInputs('volume_assumptions', 'auditions_free_per_cd_per_month', v)} step={0.5} />
              </InputField>
              <InputField label="Auditions/CD/Month (Premium)" helper="Avg audition requests by premium CDs">
                <NumberInput value={inputs.volume_assumptions.auditions_premium_per_cd_per_month} onChange={(v) => updateInputs('volume_assumptions', 'auditions_premium_per_cd_per_month', v)} step={0.5} />
              </InputField>
            </div>
            <InputField label="Notifications/User/Month" helper="Avg notifications sent per user">
              <NumberInput value={inputs.volume_assumptions.notifications_per_user_per_month} onChange={(v) => updateInputs('volume_assumptions', 'notifications_per_user_per_month', v)} step={0.5} />
            </InputField>
          </CardContent>
        </Card>

        {/* Unit Costs */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <FileCheck className="w-5 h-5 text-slate-600" />
              Unit Costs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <InputField label="Payment Processing %" helper="Gateway fee on paid revenue">
                <NumberInput value={inputs.unit_costs.payment_processing_pct} onChange={(v) => updateInputs('unit_costs', 'payment_processing_pct', v)} suffix="%" step={0.1} />
              </InputField>
              <InputField label="AI Tagging/Upload" helper="Cost per new artist upload">
                <NumberInput value={inputs.unit_costs.ai_tagging_cost_per_upload} onChange={(v) => updateInputs('unit_costs', 'ai_tagging_cost_per_upload', v)} prefix="₹" step={0.5} />
              </InputField>
              <InputField label="AI Search/Premium User/Month" helper="AI search cost per premium user">
                <NumberInput value={inputs.unit_costs.ai_search_cost_per_premium_user_per_month} onChange={(v) => updateInputs('unit_costs', 'ai_search_cost_per_premium_user_per_month', v)} prefix="₹" step={0.5} />
              </InputField>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <InputField label="Audition Video/Request" helper="Storage/compute cost per audition">
                <NumberInput value={inputs.unit_costs.audition_video_cost_per_request} onChange={(v) => updateInputs('unit_costs', 'audition_video_cost_per_request', v)} prefix="₹" step={0.5} />
              </InputField>
              <InputField label="Notification Cost/Message" helper="SMS/push/email cost per notification">
                <NumberInput value={inputs.unit_costs.notification_cost_per_message} onChange={(v) => updateInputs('unit_costs', 'notification_cost_per_message', v)} prefix="₹" step={0.1} />
              </InputField>
              <InputField label="Ad Serving Cost %" helper="Cost % of ad revenue">
                <NumberInput value={inputs.unit_costs.ad_serving_cost_pct} onChange={(v) => updateInputs('unit_costs', 'ad_serving_cost_pct', v)} suffix="%" step={0.5} />
              </InputField>
            </div>
          </CardContent>
        </Card>

        {/* Team / Salary (Dynamic) */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <Users className="w-5 h-5 text-slate-600" />
              Team & Salaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamMembersSection
              members={inputs.team_costs.members}
              esopPercentage={inputs.team_costs.esop_percentage}
              onUpdate={(field, value) => updateInputs('team_costs', field, value)}
            />
          </CardContent>
        </Card>

        {/* Funding (Dynamic) */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <Wallet className="w-5 h-5 text-slate-600" />
              Funding Rounds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-2">Fields: round name, amount, timing, and investor (optional).</p>
            <DynamicItemsSection
              items={inputs.funding.rounds}
              onUpdate={(items) => updateInputs('funding', 'rounds', items)}
              itemType="funding"
              fields={['amount', 'start_month', 'investor']}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Physical Infrastructure */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <Building className="w-5 h-5 text-slate-600" />
              Physical Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Office Rent" helper="Monthly rent cost">
                <NumberInput value={inputs.physical_infra.office_rent} onChange={(v) => updateInputs('physical_infra', 'office_rent', v)} prefix="₹" />
              </InputField>
              <InputField label="Electricity" helper="Monthly utility cost">
                <NumberInput value={inputs.physical_infra.electricity} onChange={(v) => updateInputs('physical_infra', 'electricity', v)} prefix="₹" />
              </InputField>
              <InputField label="Internet" helper="Monthly internet cost">
                <NumberInput value={inputs.physical_infra.internet} onChange={(v) => updateInputs('physical_infra', 'internet', v)} prefix="₹" />
              </InputField>
              <InputField label="Maintenance" helper="Monthly maintenance cost">
                <NumberInput value={inputs.physical_infra.maintenance} onChange={(v) => updateInputs('physical_infra', 'maintenance', v)} prefix="₹" />
              </InputField>
            </div>
            <InputField label="Office Starts From" helper="When office costs begin">
              <Select
                value={`${inputs.physical_infra.office_start_year}-${inputs.physical_infra.office_start_month}`}
                onValueChange={(v) => {
                  const [year, month] = v.split('-').map(Number);
                  updateSection('physical_infra', { office_start_year: year, office_start_month: month });
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5].map(y => [1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <SelectItem key={`${y}-${m}`} value={`${y}-${m}`}>Year {y} Month {m}</SelectItem>
                  )))}
                </SelectContent>
              </Select>
            </InputField>
          </CardContent>
        </Card>

        {/* Digital Infrastructure */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <Building className="w-5 h-5 text-slate-600" />
              Digital Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Hosting" helper="Monthly server/hosting cost">
                <NumberInput value={inputs.digital_infra.hosting} onChange={(v) => updateInputs('digital_infra', 'hosting', v)} prefix="₹" />
              </InputField>
              <InputField label="Storage" helper="Monthly storage cost">
                <NumberInput value={inputs.digital_infra.storage} onChange={(v) => updateInputs('digital_infra', 'storage', v)} prefix="₹" />
              </InputField>
              <InputField label="SaaS Tools" helper="Monthly SaaS subscriptions">
                <NumberInput value={inputs.digital_infra.saas_tools} onChange={(v) => updateInputs('digital_infra', 'saas_tools', v)} prefix="₹" />
              </InputField>
              <InputField label="AI Compute" helper="Monthly AI infra when enabled">
                <NumberInput value={inputs.digital_infra.ai_compute_enabled} onChange={(v) => updateInputs('digital_infra', 'ai_compute_enabled', v)} prefix="₹" />
              </InputField>
            </div>
          </CardContent>
        </Card>

        {/* Hardware Costs (Dynamic) */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <Laptop className="w-5 h-5 text-slate-600" />
              Hardware & Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-2">Fields: name, unit cost, quantity, and purchase timing (Y/M).</p>
            <DynamicItemsSection
              items={inputs.hardware_costs.items}
              onUpdate={(items) => updateInputs('hardware_costs', 'items', items)}
              itemType="hardware"
              fields={['unit_cost', 'quantity', 'purchase_month']}
            />
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
              <InputField label="Organic" helper="Monthly organic marketing spend">
                <NumberInput value={inputs.marketing_costs.organic} onChange={(v) => updateInputs('marketing_costs', 'organic', v)} prefix="₹" />
              </InputField>
              <InputField label="Paid" helper="Monthly paid marketing spend">
                <NumberInput value={inputs.marketing_costs.paid} onChange={(v) => updateInputs('marketing_costs', 'paid', v)} prefix="₹" />
              </InputField>
              <InputField label="Influencer" helper="Monthly influencer spend">
                <NumberInput value={inputs.marketing_costs.influencer} onChange={(v) => updateInputs('marketing_costs', 'influencer', v)} prefix="₹" />
              </InputField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Ramp Months (Y1)" helper="Months to reach full paid/influencer spend">
                <NumberInput value={inputs.marketing_costs.ramp_months_y1} onChange={(v) => updateInputs('marketing_costs', 'ramp_months_y1', v)} min={1} step={1} />
              </InputField>
              <InputField label="Annual Scale %" helper="Yearly growth rate for marketing budget">
                <NumberInput value={inputs.marketing_costs.annual_scale_pct} onChange={(v) => updateInputs('marketing_costs', 'annual_scale_pct', v)} suffix="%" step={1} />
              </InputField>
            </div>
          </CardContent>
        </Card>

        {/* Travel Costs (Dynamic) */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <Car className="w-5 h-5 text-slate-600" />
              Travel Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-2">Fields: name, monthly amount, start timing, and recurring vs one‑time.</p>
            <DynamicItemsSection
              items={inputs.travel_costs.items}
              onUpdate={(items) => updateInputs('travel_costs', 'items', items)}
              itemType="travel"
              fields={['estimated_monthly', 'is_recurring', 'start_month']}
            />
          </CardContent>
        </Card>

        {/* Admin & Compliance */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <FileCheck className="w-5 h-5 text-slate-600" />
              Admin & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <InputField label="Legal" helper="Monthly legal expenses">
                <NumberInput value={inputs.admin_costs.legal} onChange={(v) => updateInputs('admin_costs', 'legal', v)} prefix="₹" />
              </InputField>
              <InputField label="Compliance" helper="Monthly compliance costs">
                <NumberInput value={inputs.admin_costs.compliance} onChange={(v) => updateInputs('admin_costs', 'compliance', v)} prefix="₹" />
              </InputField>
              <InputField label="Accounting" helper="Monthly accounting costs">
                <NumberInput value={inputs.admin_costs.accounting} onChange={(v) => updateInputs('admin_costs', 'accounting', v)} prefix="₹" />
              </InputField>
            </div>
            <SliderInput label="Misc Buffer %" value={inputs.admin_costs.misc_buffer_percentage} onChange={(v) => updateInputs('admin_costs', 'misc_buffer_percentage', v)} min={0} max={25} step={1} />
            <p className="text-xs text-slate-500">Extra admin buffer applied on total admin costs.</p>
          </CardContent>
        </Card>

        {/* Other Expenses (Dynamic) */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <MoreHorizontal className="w-5 h-5 text-slate-600" />
              Other Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-2">Fields: name, amount, start timing, and recurring vs one‑time.</p>
            <DynamicItemsSection
              items={inputs.other_expenses.items}
              onUpdate={(items) => updateInputs('other_expenses', 'items', items)}
              itemType="expense"
              fields={['amount', 'is_recurring', 'start_month']}
            />
          </CardContent>
        </Card>

        {/* Other Income (Dynamic) */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <DollarSign className="w-5 h-5 text-slate-600" />
              Other Income Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-2">Fields: name, amount, start timing, and recurring vs one‑time.</p>
            <DynamicItemsSection
              items={inputs.other_income.items}
              onUpdate={(items) => updateInputs('other_income', 'items', items)}
              itemType="income"
              fields={['amount', 'is_recurring', 'start_month']}
            />
          </CardContent>
        </Card>

        {/* Tax */}
        <Card className="input-section border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="input-section-title">
              <FileCheck className="w-5 h-5 text-slate-600" />
              Tax & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Corporate Tax %" helper="Tax on positive EBIT">
                <NumberInput value={inputs.tax_inputs.corporate_tax_rate} onChange={(v) => updateInputs('tax_inputs', 'corporate_tax_rate', v)} suffix="%" max={40} />
              </InputField>
              <InputField label="GST Rate %" helper="Indirect tax rate (if applicable)">
                <NumberInput value={inputs.tax_inputs.gst_rate} onChange={(v) => updateInputs('tax_inputs', 'gst_rate', v)} suffix="%" max={28} />
              </InputField>
              <InputField label="TDS Rate %" helper="Withholding tax rate">
                <NumberInput value={inputs.tax_inputs.tds_rate} onChange={(v) => updateInputs('tax_inputs', 'tds_rate', v)} suffix="%" max={30} />
              </InputField>
              <InputField label="Depreciation %" helper="Annual depreciation on opex">
                <NumberInput value={inputs.tax_inputs.depreciation_rate} onChange={(v) => updateInputs('tax_inputs', 'depreciation_rate', v)} suffix="%" max={40} />
              </InputField>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
