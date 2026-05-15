import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_registration():
    print("Testing Registration...")
    
    # Registration data
    register_data = {
        "email": "vijay@gmail.com",
        "full_name": "Vijay Kumar",
        "password": "test123456",
        "student_id": "STU2024001",
        "department": "Computer Science",
        "year": 2024
    }
    
    # Make registration request
    response = requests.post(
        f"{BASE_URL}/api/auth/register",
        json=register_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Registration Status: {response.status_code}")
    if response.status_code == 200:
        print("✓ Registration Successful!")
        print(f"Response: {response.json()}")
        return True
    else:
        print(f"✗ Registration Failed: {response.text}")
        return False

def test_login():
    print("\nTesting Login...")
    
    # Login data
    login_data = {
        "email": "vijay@gmail.com",
        "password": "test123456"
    }
    
    # Make login request
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Login Status: {response.status_code}")
    if response.status_code == 200:
        print("✓ Login Successful!")
        print(f"Token: {response.json()['access_token'][:50]}...")
        return response.json()
    else:
        print(f"✗ Login Failed: {response.text}")
        return None

if __name__ == "__main__":
    print("=" * 50)
    print("API Authentication Test")
    print("=" * 50)
    
    # Test registration
    if test_registration():
        # Test login
        test_login()