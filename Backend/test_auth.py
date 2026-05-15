import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_registration():
    print("=" * 50)
    print("Testing Registration")
    print("=" * 50)
    
    # Registration data
    register_data = {
        "email": "vijay@gmail.com",
        "full_name": "Vijay Kumar",
        "password": "test123",
        "student_id": "STU2024001",
        "department": "Computer Science",
        "year": 2024
    }
    
    print(f"Sending data: {json.dumps(register_data, indent=2)}")
    
    try:
        # Make registration request
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=register_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("\n✅ Registration Successful!")
            return True
        else:
            print("\n❌ Registration Failed!")
            return False
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to server. Make sure the server is running!")
        print("   Start the server with: python -m uvicorn app.main:app --reload")
        return False

def test_login():
    print("\n" + "=" * 50)
    print("Testing Login")
    print("=" * 50)
    
    # Login data
    login_data = {
        "email": "vijay@gmail.com",
        "password": "test123"
    }
    
    print(f"Sending data: {json.dumps(login_data, indent=2)}")
    
    try:
        # Make login request
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("\n✅ Login Successful!")
            data = response.json()
            print(f"Token: {data['access_token'][:50]}...")
            return True
        else:
            print("\n❌ Login Failed!")
            return False
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to server. Make sure the server is running!")
        return False

if __name__ == "__main__":
    print("\n🔍 AI Proctoring System API Test")
    print("Make sure your server is running on http://127.0.0.1:8000")
    print("Start server with: python -m uvicorn app.main:app --reload\n")
    
    # Test registration
    if test_registration():
        # If registration works, test login
        test_login()
    else:
        print("\n⚠️  Registration failed. Please check:")
        print("  1. Server is running")
        print("  2. Database is properly set up")
        print("  3. No duplicate email exists")