#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, List

class SheverTechnicalAPITester:
    def __init__(self):
        self.base_url = "https://shever-build.preview.emergentagent.com/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.test_results = []

    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name}: {details}")
        
        self.test_results.append({
            "test_name": test_name,
            "success": success,
            "details": details
        })

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, data: Dict = None, headers: Dict = None) -> tuple:
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_result(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log_result(name, False, f"Expected {expected_status}, got {response.status_code}: {response.text}")
                return False, {}

        except requests.exceptions.RequestException as e:
            self.log_result(name, False, f"Request failed: {str(e)}")
            return False, {}
        except Exception as e:
            self.log_result(name, False, f"Unexpected error: {str(e)}")
            return False, {}

    def test_public_endpoints(self):
        """Test all public endpoints"""
        print("\n🔍 Testing Public Endpoints...")
        
        # Test API root
        self.run_test("API Root", "GET", "", 200)
        
        # Test services
        success, services = self.run_test("Get Services", "GET", "services", 200)
        if success and isinstance(services, list):
            self.log_result("Services Data Structure", len(services) >= 9, f"Expected at least 9 services, got {len(services)}")
            
            if services:
                # Test individual service
                first_service = services[0]
                service_id = first_service.get('id')
                if service_id:
                    self.run_test("Get Individual Service", "GET", f"services/{service_id}", 200)
        
        # Test projects
        self.run_test("Get Projects", "GET", "projects", 200)
        
        # Test contact info
        success, contact = self.run_test("Get Contact Info", "GET", "contact-info", 200)
        if success and isinstance(contact, dict):
            required_fields = ['phone', 'email', 'address', 'trn']
            missing_fields = [field for field in required_fields if not contact.get(field)]
            if not missing_fields:
                self.log_result("Contact Info Structure", True)
            else:
                self.log_result("Contact Info Structure", False, f"Missing fields: {missing_fields}")
        
        # Test home content
        self.run_test("Get Home Content", "GET", "home-content", 200)
        
        # Test gallery
        self.run_test("Get Gallery", "GET", "gallery", 200)
        
        # Test site settings
        self.run_test("Get Site Settings", "GET", "site-settings", 200)

    def test_contact_submission(self):
        """Test contact form submission"""
        print("\n📝 Testing Contact Submission...")
        
        submission_data = {
            "name": "Test User",
            "phone": "+971501234567",
            "email": "test@example.com",
            "service_required": "HVAC Maintenance",
            "message": "This is a test submission from backend tests."
        }
        
        success, result = self.run_test("Submit Contact Form", "POST", "contact-submissions", 200, submission_data)
        if success:
            self.submission_id = result.get('id')

    def test_admin_authentication(self):
        """Test admin authentication"""
        print("\n🔐 Testing Admin Authentication...")
        
        # Test login with correct credentials
        login_data = {
            "email": "admin@shever-tech.com",
            "password": "admin123"
        }
        
        success, result = self.run_test("Admin Login", "POST", "admin/login", 200, login_data)
        if success and 'access_token' in result:
            self.token = result['access_token']
            self.log_result("Token Received", True)
        else:
            self.log_result("Token Received", False, "No access token in response")
        
        # Test login with wrong credentials
        wrong_data = {
            "email": "admin@shever-tech.com",
            "password": "wrongpassword"
        }
        self.run_test("Admin Login (Wrong Password)", "POST", "admin/login", 401, wrong_data)

    def test_admin_protected_endpoints(self):
        """Test admin protected endpoints"""
        if not self.token:
            print("\n❌ Skipping admin protected tests - no valid token")
            return
            
        print("\n🛡️ Testing Admin Protected Endpoints...")
        
        # Test admin stats
        self.run_test("Admin Stats", "GET", "admin/stats", 200)
        
        # Test contact submissions view
        self.run_test("View Contact Submissions", "GET", "admin/contact-submissions", 200)
        
        # Test service creation
        new_service = {
            "name": "Test Service",
            "description": "Test service description",
            "benefits": ["Test benefit 1", "Test benefit 2"],
            "problems_solved": ["Test problem 1", "Test problem 2"],
            "icon": "wrench",
            "order": 99
        }
        
        success, service_result = self.run_test("Create Service", "POST", "admin/services", 200, new_service)
        if success:
            test_service_id = service_result.get('id')
            if test_service_id:
                # Test service update
                updated_service = new_service.copy()
                updated_service['name'] = "Updated Test Service"
                self.run_test("Update Service", "PUT", f"admin/services/{test_service_id}", 200, updated_service)
                
                # Test service deletion
                self.run_test("Delete Service", "DELETE", f"admin/services/{test_service_id}", 200)

    def test_file_serving(self):
        """Test static file serving for uploads"""
        print("\n📁 Testing File Serving...")
        
        # Test uploads endpoint accessibility
        try:
            response = requests.get(f"https://shever-build.preview.emergentagent.com/uploads/", timeout=10)
            if response.status_code in [200, 403, 404]:  # 403/404 are acceptable for directory listing
                self.log_result("Uploads Directory Accessible", True)
            else:
                self.log_result("Uploads Directory Accessible", False, f"Got {response.status_code}")
        except Exception as e:
            self.log_result("Uploads Directory Accessible", False, str(e))

    def run_all_tests(self):
        """Run comprehensive API testing"""
        print("🚀 Starting Shever Technical API Tests")
        print(f"Base URL: {self.base_url}")
        print("=" * 50)
        
        try:
            self.test_public_endpoints()
            self.test_contact_submission()
            self.test_admin_authentication()
            self.test_admin_protected_endpoints()
            self.test_file_serving()
            
        except KeyboardInterrupt:
            print("\n\n⏹️ Tests interrupted by user")
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0.0%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  • {test['test']}: {test['details']}")
        
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.failed_tests,
            "success_rate": (self.tests_passed/self.tests_run*100) if self.tests_run > 0 else 0,
            "detailed_results": self.test_results
        }

if __name__ == "__main__":
    tester = SheverTechnicalAPITester()
    results = tester.run_all_tests()
    
    # Exit with non-zero status if there are failures
    sys.exit(0 if len(tester.failed_tests) == 0 else 1)