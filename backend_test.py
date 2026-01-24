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
            # Validate structure
            required_sections = [
                'timeline', 'user_growth', 'artist_monetization', 'cd_monetization',
                'transactional', 'team_costs', 'infra_costs', 'marketing_costs',
                'admin_costs', 'tax_inputs', 'funding'
            ]
            
            missing_sections = [section for section in required_sections if section not in response]
            if missing_sections:
                print(f"⚠️  Missing sections in default inputs: {missing_sections}")
            else:
                print("✅ All required sections present in default inputs")
                
        return success, response

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

    def test_input_validation(self):
        """Test input validation"""
        print("\n=== Testing Input Validation ===")
        
        # Test with invalid/empty inputs
        invalid_inputs = {
            "timeline": {"revenue_start_month": 13},  # Invalid month
            "user_growth": {"artists_y1": -100}  # Negative users
        }
        
        # This should either return 400 or handle gracefully
        success, response = self.run_test(
            "Invalid inputs test",
            "POST",
            "api/calculate",
            None,  # Accept any status for this test
            data=invalid_inputs
        )
        
        print(f"   Input validation test completed (status varies by implementation)")
        return True

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