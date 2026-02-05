#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class EcoDePINAPITester:
    def __init__(self, base_url="https://eco-asset-portal.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details="", expected_status=None, actual_status=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            if expected_status and actual_status:
                print(f"   Expected: {expected_status}, Got: {actual_status}")
        
        self.test_results.append({
            "test_name": name,
            "success": success,
            "details": details,
            "expected_status": expected_status,
            "actual_status": actual_status
        })

    def test_health_check(self):
        """Test basic health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            success = response.status_code == 200
            self.log_test("Health Check", success, 
                         f"Response: {response.json() if success else response.text}", 
                         200, response.status_code)
            return success
        except Exception as e:
            self.log_test("Health Check", False, f"Error: {str(e)}")
            return False

    def test_get_segments(self):
        """Test GET /api/segments - should return 5 segments"""
        try:
            response = requests.get(f"{self.base_url}/api/segments", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if len(data) == 5:
                    # Check if all expected segments are present
                    expected_segments = ['data-centers', 'battery-storage', 'ev-charging', 'renewable-energy', 'green-credits']
                    actual_segments = [seg['segment_id'] for seg in data]
                    
                    if all(seg in actual_segments for seg in expected_segments):
                        self.log_test("GET /api/segments (5 segments)", True, f"Found all 5 segments: {actual_segments}")
                    else:
                        self.log_test("GET /api/segments (5 segments)", False, f"Missing segments. Expected: {expected_segments}, Got: {actual_segments}")
                        success = False
                else:
                    self.log_test("GET /api/segments (5 segments)", False, f"Expected 5 segments, got {len(data)}")
                    success = False
            else:
                self.log_test("GET /api/segments", False, f"HTTP {response.status_code}: {response.text}", 200, response.status_code)
            
            return success, data if success else None
        except Exception as e:
            self.log_test("GET /api/segments", False, f"Error: {str(e)}")
            return False, None

    def test_get_plans(self):
        """Test GET /api/plans - should return investment plans with APY and risk levels"""
        try:
            response = requests.get(f"{self.base_url}/api/plans", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if len(data) > 0:
                    # Check if plans have required fields
                    sample_plan = data[0]
                    required_fields = ['plan_id', 'segment_id', 'name', 'apy', 'risk_level', 'min_investment', 'max_investment']
                    
                    if all(field in sample_plan for field in required_fields):
                        self.log_test("GET /api/plans (with APY & risk)", True, f"Found {len(data)} plans with required fields")
                    else:
                        missing_fields = [field for field in required_fields if field not in sample_plan]
                        self.log_test("GET /api/plans", False, f"Missing fields: {missing_fields}")
                        success = False
                else:
                    self.log_test("GET /api/plans", False, "No plans returned")
                    success = False
            else:
                self.log_test("GET /api/plans", False, f"HTTP {response.status_code}: {response.text}", 200, response.status_code)
            
            return success, data if success else None
        except Exception as e:
            self.log_test("GET /api/plans", False, f"Error: {str(e)}")
            return False, None

    def test_calculator(self, plans_data):
        """Test POST /api/calculator - should return projected returns"""
        if not plans_data:
            self.log_test("POST /api/calculator", False, "No plans data available for testing")
            return False
        
        try:
            # Use first plan for testing
            test_plan = plans_data[0]
            test_amount = test_plan['min_investment']
            
            payload = {
                "plan_id": test_plan['plan_id'],
                "amount": test_amount
            }
            
            response = requests.post(
                f"{self.base_url}/api/calculator",
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = ['plan', 'investment_amount', 'projected_returns', 'total_at_end']
                
                if all(field in data for field in required_fields):
                    returns = data['projected_returns']
                    if all(key in returns for key in ['daily', 'monthly', 'yearly', 'lock_period']):
                        self.log_test("POST /api/calculator", True, f"Calculator working for plan {test_plan['plan_id']}, amount ${test_amount}")
                    else:
                        self.log_test("POST /api/calculator", False, "Missing return calculation fields")
                        success = False
                else:
                    self.log_test("POST /api/calculator", False, f"Missing response fields: {[f for f in required_fields if f not in data]}")
                    success = False
            else:
                self.log_test("POST /api/calculator", False, f"HTTP {response.status_code}: {response.text}", 200, response.status_code)
            
            return success
        except Exception as e:
            self.log_test("POST /api/calculator", False, f"Error: {str(e)}")
            return False

    def test_segment_detail(self, segments_data):
        """Test GET /api/segments/{segment_id} for individual segments"""
        if not segments_data:
            self.log_test("GET /api/segments/{id}", False, "No segments data available")
            return False
        
        success_count = 0
        for segment in segments_data[:2]:  # Test first 2 segments
            try:
                response = requests.get(f"{self.base_url}/api/segments/{segment['segment_id']}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if data['segment_id'] == segment['segment_id']:
                        success_count += 1
                        self.log_test(f"GET /api/segments/{segment['segment_id']}", True, "Segment detail retrieved")
                    else:
                        self.log_test(f"GET /api/segments/{segment['segment_id']}", False, "Wrong segment returned")
                else:
                    self.log_test(f"GET /api/segments/{segment['segment_id']}", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_test(f"GET /api/segments/{segment['segment_id']}", False, f"Error: {str(e)}")
        
        return success_count == 2

    def test_plans_by_segment(self, segments_data):
        """Test GET /api/plans?segment_id={segment_id}"""
        if not segments_data:
            self.log_test("GET /api/plans?segment_id=", False, "No segments data available")
            return False
        
        try:
            test_segment = segments_data[0]['segment_id']
            response = requests.get(f"{self.base_url}/api/plans?segment_id={test_segment}", timeout=10)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                if len(data) > 0 and all(plan['segment_id'] == test_segment for plan in data):
                    self.log_test(f"GET /api/plans?segment_id={test_segment}", True, f"Found {len(data)} plans for segment")
                else:
                    self.log_test(f"GET /api/plans?segment_id={test_segment}", False, "No plans or wrong segment plans returned")
                    success = False
            else:
                self.log_test(f"GET /api/plans?segment_id={test_segment}", False, f"HTTP {response.status_code}")
            
            return success
        except Exception as e:
            self.log_test(f"GET /api/plans?segment_id=", False, f"Error: {str(e)}")
            return False

    def test_supported_wallets(self):
        """Test GET /api/wallet/supported - should return 4 EVM wallets"""
        try:
            response = requests.get(f"{self.base_url}/api/wallet/supported", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if data.get('success') and 'data' in data and 'wallets' in data['data']:
                    wallets = data['data']['wallets']
                    expected_wallets = ['metamask', 'trust_wallet', 'walletconnect', 'coinbase']
                    actual_wallet_types = [w['type'] for w in wallets]
                    
                    if len(wallets) == 4 and all(wtype in actual_wallet_types for wtype in expected_wallets):
                        self.log_test("GET /api/wallet/supported (4 EVM wallets)", True, f"Found all 4 EVM wallets: {actual_wallet_types}")
                    else:
                        self.log_test("GET /api/wallet/supported", False, f"Expected 4 EVM wallets {expected_wallets}, got {actual_wallet_types}")
                        success = False
                else:
                    self.log_test("GET /api/wallet/supported", False, "Invalid response structure")
                    success = False
            else:
                self.log_test("GET /api/wallet/supported", False, f"HTTP {response.status_code}: {response.text}", 200, response.status_code)
            
            return success
        except Exception as e:
            self.log_test("GET /api/wallet/supported", False, f"Error: {str(e)}")
            return False

    def test_plans_count(self):
        """Test GET /api/plans - should return 15 investment plans"""
        try:
            response = requests.get(f"{self.base_url}/api/plans", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if len(data) == 15:
                    self.log_test("GET /api/plans (15 plans)", True, f"Found exactly 15 investment plans")
                else:
                    self.log_test("GET /api/plans (15 plans)", False, f"Expected 15 plans, got {len(data)}")
                    success = False
            else:
                self.log_test("GET /api/plans (15 plans)", False, f"HTTP {response.status_code}: {response.text}", 200, response.status_code)
            
            return success
        except Exception as e:
            self.log_test("GET /api/plans (15 plans)", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting EcoDePIN Backend API Tests - EVM Wallet Migration")
        print(f"📍 Testing: {self.base_url}")
        print("=" * 60)
        
        # Test 1: Health check
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return self.generate_report()
        
        # Test 2: Get segments (should return 5)
        segments_success, segments_data = self.test_get_segments()
        
        # Test 3: Get plans (should return 15 plans)
        self.test_plans_count()
        
        # Test 4: Get plans (should have APY and risk levels)
        plans_success, plans_data = self.test_get_plans()
        
        # Test 5: Supported wallets (should return 4 EVM wallets)
        self.test_supported_wallets()
        
        # Test 6: Calculator endpoint
        if plans_data:
            self.test_calculator(plans_data)
        
        # Test 7: Individual segment details
        if segments_data:
            self.test_segment_detail(segments_data)
        
        # Test 8: Plans by segment
        if segments_data:
            self.test_plans_by_segment(segments_data)
        
        return self.generate_report()

    def generate_report(self):
        """Generate test report"""
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check details above.")
            failed_tests = [test for test in self.test_results if not test['success']]
            print(f"\n❌ Failed tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test_name']}: {test['details']}")
            return False

def main():
    tester = EcoDePINAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())