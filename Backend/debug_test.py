import requests
import json

BASE_URL = "http://127.0.0.1:8000"

print("=" * 60)
print("DEBUG: Testing Registration and Login")
print("=" * 60)

# First, delete existing user by trying to register new one
test_email = f"test_{__import__('time').time()}@example.com"
print(f"\nUsing test email: {test_email}")

# Test registration
register_data = {
    "email": test_email,
    "full_name": "Test User",
    "password": "test123",
    "student_id": "TEST001",
    "department": "Engineering",
    "year": 2024
}

print("\n1. Registering...")
response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
print(f"   Status: {response.status_code}")
print(f"   Response: {response.text}")

if response.status_code == 201:
    print("   ✓ Registration successful")
    
    # Test login with same credentials
    login_data = {
        "email": test_email,
        "password": "test123"
    }
    
    print("\n2. Logging in...")
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text}")
    
    if response.status_code == 200:
        print("   ✓ Login successful!")
    else:
        print("   ✗ Login failed - Password verification issue")
        
        # Try with different password just to see
        print("\n3. Trying wrong password...")
        login_data["password"] = "wrongpassword"
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        print(f"   Status: {response.status_code} (Should be 401)")
else:
    print("   ✗ Registration failed")
