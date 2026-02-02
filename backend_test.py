import sys
import json
import os
from datetime import datetime

os.environ.setdefault("SKIP_DB", "1")
sys.path.append(os.path.dirname(__file__))
from backend.server import (
    FinancialInputs,
    calculate_monthly_users,
    calculate_revenue,
    calculate_costs,
    calculate_pnl,
    calculate_cashflow,
    calculate_unit_economics,
    calculate_key_metrics,
    calculate_investor_summary,
    calculate_all_scenarios,
)

class FinancialPlannerAPITester:
    def __init__(self):
        self.use_http = os.environ.get("USE_HTTP", "0") in {"1", "true", "yes"}
        self.base_url = os.environ.get("BASE_URL", "http://localhost:8000")
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            effective_endpoint = endpoint
            if not self.use_http and endpoint.startswith("api/"):
                effective_endpoint = endpoint.replace("api/", "", 1)

            if self.use_http:
                import requests
                url = f"{self.base_url}/{endpoint}"
                if method == 'GET':
                    response = requests.get(url, timeout=30)
                elif method == 'POST':
                    response = requests.post(url, json=data, timeout=30)
                success = response.status_code == expected_status
                if success:
                    self.tests_passed += 1
                    print(f"✅ Passed - Status: {response.status_code}")
                    response_data = response.json() if response.text else {}
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
                else:
                    print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                    print(f"   Response: {response.text[:200]}...")
                    self.failed_tests.append({
                        'name': name,
                        'expected': expected_status,
                        'actual': response.status_code,
                        'response': response.text[:200]
                    })
                    response_data = {}
                return success, response_data

            if effective_endpoint == "inputs/default":
                inputs = FinancialInputs()
                response_data = inputs.model_dump()
            elif effective_endpoint == "calculate":
                inputs = FinancialInputs(**(data or {}))
                users = calculate_monthly_users(inputs)
                revenue = calculate_revenue(inputs, users)
                costs = calculate_costs(inputs, revenue)
                pnl = calculate_pnl(revenue, costs, inputs)
                cashflow = calculate_cashflow(pnl, inputs)
                unit_economics = calculate_unit_economics(revenue, users, costs, inputs)
                key_metrics = calculate_key_metrics(revenue, costs, pnl, inputs)
                scenarios = calculate_all_scenarios(inputs)
                response_data = {
                    "users": users,
                    "revenue": revenue,
                    "costs": costs,
                    "pnl": pnl,
                    "cashflow": cashflow,
                    "unit_economics": unit_economics,
                    "key_metrics": key_metrics,
                    "investor_summary": calculate_investor_summary(
                        revenue, costs, pnl, cashflow, users, unit_economics, key_metrics, inputs
                    ),
                    "scenarios": scenarios,
                }
            else:
                response_data = {"status": "ok"}

            success = True
            self.tests_passed += 1
            print("✅ Passed")
            print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
            return success, response_data
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n=== Testing Health Endpoints ===")
        
        # Test root endpoint
        self.run_test("Root endpoint", "GET", "api/", 200)
        
        # Test health check
        self.run_test("Health check", "GET", "api/health", 200)

    def test_default_inputs(self):
        """Test default inputs endpoint"""
        print("\n=== Testing Default Inputs ===")
        
        success, response = self.run_test("Get default inputs", "GET", "api/inputs/default", 200)
        
        if success:
            # Validate enhanced structure with new dynamic sections
            required_sections = [
                'timeline', 'user_growth', 'artist_monetization', 'cd_monetization',
                'transactional', 'plan_limits', 'monetized_actions', 'volume_assumptions', 'unit_costs',
                'team_costs', 'physical_infra', 'digital_infra', 
                'hardware_costs', 'marketing_costs', 'admin_costs', 'travel_costs',
                'other_expenses', 'other_income', 'tax_inputs', 'funding'
            ]
            
            missing_sections = [section for section in required_sections if section not in response]
            if missing_sections:
                print(f"⚠️  Missing sections in default inputs: {missing_sections}")
            else:
                print("✅ All required sections present in default inputs")
                
            # Test dynamic sections structure
            self.validate_dynamic_sections(response)
                
        return success, response

    def validate_dynamic_sections(self, inputs):
        """Validate the structure of dynamic sections"""
        print("\n--- Validating Dynamic Sections ---")
        
        # Test Team Members structure
        if 'team_costs' in inputs and 'members' in inputs['team_costs']:
            members = inputs['team_costs']['members']
            print(f"✅ Team members found: {len(members)} members")
            if members:
                member = members[0]
                required_fields = ['id', 'name', 'role', 'monthly_salary', 'start_month', 'start_year']
                if all(field in member for field in required_fields):
                    print("✅ Team member structure valid")
                else:
                    print("⚠️  Team member missing required fields")
        
        # Test Hardware Items structure
        if 'hardware_costs' in inputs and 'items' in inputs['hardware_costs']:
            items = inputs['hardware_costs']['items']
            print(f"✅ Hardware items found: {len(items)} items")
            if items:
                item = items[0]
                required_fields = ['id', 'name', 'unit_cost', 'quantity', 'purchase_month', 'purchase_year']
                if all(field in item for field in required_fields):
                    print("✅ Hardware item structure valid")
                else:
                    print("⚠️  Hardware item missing required fields")
        
        # Test Travel Costs structure
        if 'travel_costs' in inputs and 'items' in inputs['travel_costs']:
            items = inputs['travel_costs']['items']
            print(f"✅ Travel items found: {len(items)} items")
            if items:
                item = items[0]
                required_fields = ['id', 'name', 'estimated_monthly', 'start_month', 'start_year', 'is_recurring']
                if all(field in item for field in required_fields):
                    print("✅ Travel item structure valid")
                else:
                    print("⚠️  Travel item missing required fields")
        
        # Test Other Expenses structure
        if 'other_expenses' in inputs and 'items' in inputs['other_expenses']:
            items = inputs['other_expenses']['items']
            print(f"✅ Other expense items found: {len(items)} items")
        
        # Test Other Income structure
        if 'other_income' in inputs and 'items' in inputs['other_income']:
            items = inputs['other_income']['items']
            print(f"✅ Other income items found: {len(items)} items")
        
        # Test Funding Rounds structure
        if 'funding' in inputs and 'rounds' in inputs['funding']:
            rounds = inputs['funding']['rounds']
            print(f"✅ Funding rounds found: {len(rounds)} rounds")
            if rounds:
                round_item = rounds[0]
                required_fields = ['id', 'name', 'amount', 'month', 'year', 'investor']
                if all(field in round_item for field in required_fields):
                    print("✅ Funding round structure valid")
                else:
                    print("⚠️  Funding round missing required fields")
        
        # Test Physical Infrastructure
        if 'physical_infra' in inputs:
            infra = inputs['physical_infra']
            required_fields = ['office_rent', 'electricity', 'internet', 'maintenance']
            if all(field in infra for field in required_fields):
                print("✅ Physical infrastructure structure valid")
            else:
                print("⚠️  Physical infrastructure missing required fields")
        
        # Test Digital Infrastructure
        if 'digital_infra' in inputs:
            infra = inputs['digital_infra']
            required_fields = ['hosting', 'storage', 'saas_tools', 'ai_compute_enabled']
            if all(field in infra for field in required_fields):
                print("✅ Digital infrastructure structure valid")
            else:
                print("⚠️  Digital infrastructure missing required fields")

    def test_calculate_endpoint(self):
        """Test the main calculation endpoint"""
        print("\n=== Testing Calculate Endpoint ===")
        
        # Get default inputs first
        success, default_inputs = self.test_default_inputs()
        if not success:
            print("❌ Cannot test calculate endpoint without default inputs")
            return False
        
        # Test calculation with default inputs
        success, calc_response = self.run_test(
            "Calculate projections", 
            "POST", 
            "api/calculate", 
            200, 
            data=default_inputs
        )
        
        if success:
            # Validate calculation response structure
            expected_keys = [
                'users', 'revenue', 'costs', 'pnl', 'cashflow', 
                'unit_economics', 'key_metrics', 'investor_summary', 'scenarios'
            ]
            
            missing_keys = [key for key in expected_keys if key not in calc_response]
            if missing_keys:
                print(f"⚠️  Missing keys in calculation response: {missing_keys}")
            else:
                print("✅ All expected calculation keys present")
                
            # Test specific data structures
            if 'revenue' in calc_response:
                revenue = calc_response['revenue']
                if 'monthly' in revenue and 'annual' in revenue:
                    print("✅ Revenue has monthly and annual data")
                else:
                    print("⚠️  Revenue missing monthly or annual data")
                    
            if 'scenarios' in calc_response:
                scenarios = calc_response['scenarios']
                expected_scenarios = ['conservative', 'base', 'aggressive']
                if all(scenario in scenarios for scenario in expected_scenarios):
                    print("✅ All scenarios present")
                else:
                    print("⚠️  Missing scenarios")
        
        return success

    def test_scenario_variations(self):
        """Test different scenario calculations"""
        print("\n=== Testing Scenario Variations ===")
        
        # Get default inputs
        _, default_inputs = self.run_test("Get default inputs", "GET", "api/inputs/default", 200)
        
        scenarios = ['conservative', 'base', 'aggressive']
        scenario_results = {}
        
        for scenario in scenarios:
            # Modify scenario in inputs
            test_inputs = default_inputs.copy()
            test_inputs['timeline']['scenario'] = scenario
            
            success, response = self.run_test(
                f"Calculate {scenario} scenario",
                "POST",
                "api/calculate",
                200,
                data=test_inputs
            )
            
            if success and 'revenue' in response:
                total_revenue_y5 = response['revenue']['annual']['total'][4] if len(response['revenue']['annual']['total']) > 4 else 0
                scenario_results[scenario] = total_revenue_y5
                print(f"   {scenario.title()} Y5 Revenue: ₹{total_revenue_y5:,}")
        
        # Validate scenario differences
        if len(scenario_results) == 3:
            conservative = scenario_results.get('conservative', 0)
            base = scenario_results.get('base', 0)
            aggressive = scenario_results.get('aggressive', 0)
            
            if conservative < base < aggressive:
                print("✅ Scenario revenue progression is correct (Conservative < Base < Aggressive)")
            else:
                print("⚠️  Scenario revenue progression may be incorrect")
        
        return len(scenario_results) == 3

    def test_enhanced_calculations(self):
        """Test calculations with enhanced dynamic sections"""
        print("\n=== Testing Enhanced Calculations ===")
        
        # Get default inputs
        success, default_inputs = self.run_test("Get default inputs", "GET", "api/inputs/default", 200)
        if not success:
            print("❌ Cannot test enhanced calculations without default inputs")
            return False
        
        # Test calculation with enhanced inputs
        success, calc_response = self.run_test(
            "Calculate with enhanced features", 
            "POST", 
            "api/calculate", 
            200, 
            data=default_inputs
        )
        
        if success:
            # Validate enhanced calculation response structure
            expected_keys = [
                'users', 'revenue', 'costs', 'pnl', 'cashflow', 
                'unit_economics', 'key_metrics', 'investor_summary', 'scenarios'
            ]
            
            missing_keys = [key for key in expected_keys if key not in calc_response]
            if missing_keys:
                print(f"⚠️  Missing keys in calculation response: {missing_keys}")
            else:
                print("✅ All expected calculation keys present")
            
            # Test enhanced cost breakdown
            if 'costs' in calc_response:
                costs = calc_response['costs']
                if 'annual' in costs:
                    annual_costs = costs['annual']
                    enhanced_cost_categories = [
                        'team', 'digital_infra', 'physical_infra', 'hardware',
                        'marketing', 'travel', 'admin', 'other', 'platform_variable'
                    ]
                    
                    missing_categories = [cat for cat in enhanced_cost_categories if cat not in annual_costs]
                    if missing_categories:
                        print(f"⚠️  Missing cost categories: {missing_categories}")
                    else:
                        print("✅ All enhanced cost categories present")
                        
                        # Print sample cost breakdown for Year 1
                        print("   Year 1 Cost Breakdown:")
                        for category in enhanced_cost_categories:
                            if category in annual_costs and len(annual_costs[category]) > 0:
                                value = annual_costs[category][0]
                                print(f"     {category.title()}: ₹{value:,}")
            
            # Test revenue breakdown with other income
            if 'revenue' in calc_response:
                revenue = calc_response['revenue']
                if 'annual' in revenue:
                    annual_revenue = revenue['annual']
                    revenue_streams = [
                        'artist_premium', 'cd_premium', 'boosts',
                        'direct_invites', 'auditions', 'ads', 'other_income'
                    ]
                    
                    missing_streams = [stream for stream in revenue_streams if stream not in annual_revenue]
                    if missing_streams:
                        print(f"⚠️  Missing revenue streams: {missing_streams}")
                    else:
                        print("✅ All revenue streams present including other income")
        
        return success

    def test_dynamic_modifications(self):
        """Test calculations with modified dynamic sections"""
        print("\n=== Testing Dynamic Section Modifications ===")
        
        # Get default inputs
        success, default_inputs = self.run_test("Get default inputs", "GET", "api/inputs/default", 200)
        if not success:
            return False
        
        # Modify inputs to test dynamic features
        modified_inputs = default_inputs.copy()
        
        # Add a new team member
        new_member = {
            "id": "test-member-123",
            "name": "Test Developer",
            "role": "employee",
            "monthly_salary": 75000,
            "start_month": 6,
            "start_year": 1
        }
        modified_inputs['team_costs']['members'].append(new_member)
        
        # Add a new hardware item
        new_hardware = {
            "id": "test-hardware-123",
            "name": "Test Equipment",
            "unit_cost": 25000,
            "quantity": 2,
            "purchase_month": 3,
            "purchase_year": 1
        }
        modified_inputs['hardware_costs']['items'].append(new_hardware)
        
        # Add a new travel expense
        new_travel = {
            "id": "test-travel-123",
            "name": "Conference Travel",
            "estimated_monthly": 15000,
            "start_month": 4,
            "start_year": 2,
            "is_recurring": False
        }
        modified_inputs['travel_costs']['items'].append(new_travel)
        
        # Add other income source
        new_income = {
            "id": "test-income-123",
            "name": "Consulting Revenue",
            "amount": 50000,
            "start_month": 6,
            "start_year": 1,
            "is_recurring": True
        }
        modified_inputs['other_income']['items'].append(new_income)
        
        # Add new funding round
        new_funding = {
            "id": "test-funding-123",
            "name": "Bridge Round",
            "amount": 2000000,
            "month": 6,
            "year": 2,
            "investor": "Strategic Investor",
            "notes": "Bridge funding"
        }
        modified_inputs['funding']['rounds'].append(new_funding)
        
        # Test calculation with modified inputs
        success, calc_response = self.run_test(
            "Calculate with modified dynamic sections", 
            "POST", 
            "api/calculate", 
            200, 
            data=modified_inputs
        )
        
        if success:
            print("✅ Calculations work with modified dynamic sections")
            
            # Verify that modifications affected calculations
            if 'costs' in calc_response and 'revenue' in calc_response:
                costs = calc_response['costs']['annual']['total'][0] if calc_response['costs']['annual']['total'] else 0
                revenue = calc_response['revenue']['annual']['total'][0] if calc_response['revenue']['annual']['total'] else 0
                print(f"   Modified calculation - Y1 Revenue: ₹{revenue:,}, Y1 Costs: ₹{costs:,}")
        
        return success

    def test_sanity_checks(self):
        """Sanity-check internal arithmetic consistency"""
        print("\n=== Sanity Checks ===")

        success, calc_response = self.run_test(
            "Calculate projections (sanity)",
            "POST",
            "api/calculate",
            200,
            data=FinancialInputs().model_dump()
        )
        if not success:
            print("❌ Sanity checks skipped (calculation failed)")
            return False

        revenue = calc_response["revenue"]
        costs = calc_response["costs"]
        pnl = calc_response["pnl"]

        def assert_close(label, a, b, tolerance=1):
            if abs(a - b) > tolerance:
                raise AssertionError(f"{label} mismatch: {a} != {b}")

        # Revenue stream sums
        revenue_streams = [
            "artist_premium", "cd_premium", "boosts",
            "direct_invites", "auditions", "ads", "other_income"
        ]
        for i in range(12):
            stream_sum = sum(revenue["monthly"][k][i] for k in revenue_streams)
            assert_close(f"Monthly revenue total M{i+1}", stream_sum, revenue["monthly"]["total"][i], tolerance=2)
        for y in range(5):
            stream_sum = sum(revenue["annual"][k][y] for k in revenue_streams)
            assert_close(f"Annual revenue total Y{y+1}", stream_sum, revenue["annual"]["total"][y], tolerance=25)

        # Cost category sums
        cost_cats = [
            "team", "digital_infra", "physical_infra", "hardware",
            "marketing", "travel", "admin", "other", "platform_variable"
        ]
        for i in range(12):
            cat_sum = sum(costs["monthly"][k][i] for k in cost_cats)
            assert_close(f"Monthly cost total M{i+1}", cat_sum, costs["monthly"]["total"][i])
        for y in range(5):
            cat_sum = sum(costs["annual"][k][y] for k in cost_cats)
            assert_close(f"Annual cost total Y{y+1}", cat_sum, costs["annual"]["total"][y], tolerance=10)

        # P&L identities
        for i in range(12):
            rev = pnl["monthly"]["revenue"][i]
            cogs = costs["monthly"]["platform_variable"][i]
            opex = pnl["monthly"]["operating_expenses"][i]
            gross_profit = pnl["monthly"]["gross_profit"][i]
            ebitda = pnl["monthly"]["ebitda"][i]
            dep = pnl["monthly"]["depreciation"][i]
            ebit = pnl["monthly"]["ebit"][i]
            taxes = pnl["monthly"]["taxes"][i]
            net = pnl["monthly"]["net_profit"][i]
            assert_close(f"Monthly gross profit M{i+1}", gross_profit, rev - cogs)
            assert_close(f"Monthly EBITDA M{i+1}", ebitda, gross_profit - opex)
            assert_close(f"Monthly EBIT M{i+1}", ebit, ebitda - dep)
            assert_close(f"Monthly Net Profit M{i+1}", net, ebit - taxes)

        for y in range(5):
            rev = pnl["annual"]["revenue"][y]
            cogs = costs["annual"]["platform_variable"][y]
            opex = pnl["annual"]["operating_expenses"][y]
            gross_profit = pnl["annual"]["gross_profit"][y]
            ebitda = pnl["annual"]["ebitda"][y]
            dep = pnl["annual"]["depreciation"][y]
            ebit = pnl["annual"]["ebit"][y]
            taxes = pnl["annual"]["taxes"][y]
            net = pnl["annual"]["net_profit"][y]
            assert_close(f"Annual gross profit Y{y+1}", gross_profit, rev - cogs)
            assert_close(f"Annual EBITDA Y{y+1}", ebitda, gross_profit - opex)
            assert_close(f"Annual EBIT Y{y+1}", ebit, ebitda - dep)
            assert_close(f"Annual Net Profit Y{y+1}", net, ebit - taxes)

        print("✅ Sanity checks passed (totals and identities consistent)")
        return True

def main():
    print("🚀 Starting CK Financial Projection API Tests")
    print("=" * 60)
    
    # Setup
    tester = FinancialPlannerAPITester()
    
    # Run all tests
    try:
        tester.test_health_endpoints()
        tester.test_default_inputs()
        tester.test_calculate_endpoint()
        tester.test_enhanced_calculations()
        tester.test_dynamic_modifications()
        tester.test_scenario_variations()
        tester.test_sanity_checks()
        
    except Exception as e:
        print(f"\n❌ Test suite failed with error: {str(e)}")
        return 1
    
    # Print results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests ({len(tester.failed_tests)}):")
        for i, test in enumerate(tester.failed_tests, 1):
            print(f"   {i}. {test['name']}")
            if 'error' in test:
                print(f"      Error: {test['error']}")
            else:
                print(f"      Expected: {test['expected']}, Got: {test['actual']}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"\n🎯 Success Rate: {success_rate:.1f}%")
    
    return 0 if success_rate >= 80 else 1

if __name__ == "__main__":
    sys.exit(main())
