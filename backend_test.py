import requests
import sys
import json
from datetime import datetime

class FinancialPlannerAPITester:
    def __init__(self, base_url="https://startupfinance.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
                except:
                    print("   Response: Non-JSON or empty")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })

            return success, response.json() if success and response.text else {}

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
                'transactional', 'team_costs', 'physical_infra', 'digital_infra', 
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
                'unit_economics', 'key_metrics', 'scenarios'
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
                'unit_economics', 'key_metrics', 'scenarios'
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
                        'marketing', 'travel', 'admin', 'other'
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
                    revenue_streams = ['artist_premium', 'cd_premium', 'boosts', 'escrow', 'other_income']
                    
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

def main():
    print("🚀 Starting CastingKart Financial Planner API Tests")
    print("=" * 60)
    
    # Setup
    tester = FinancialPlannerAPITester()
    
    # Run all tests
    try:
        tester.test_health_endpoints()
        tester.test_default_inputs()
        tester.test_calculate_endpoint()
        tester.test_scenario_variations()
        tester.test_input_validation()
        
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