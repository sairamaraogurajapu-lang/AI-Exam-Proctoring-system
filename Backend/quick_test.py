import requests
import json

BASE_URL = "http://127.0.0.1:8000"

print("=" * 50)
print("Testing Registration")
print("=" * 50)

register_data = {
    "email": "vijay@gmail.com",
    "full_name": "Vijay Kumar",
    "password": "test123",
    "student_id": "STU001",
    "department": "Computer Science",
    "year": 2024
}

print(f"Sending: {json.dumps(register_data, indent=2)}")

try:
    response = requests.post(
        f"{BASE_URL}/api/auth/register",
        json=register_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 201:
        print("\n✓ Registration Successful!")
        
        print("\n" + "=" * 50)
        print("Testing Login")
        print("=" * 50)
        
        login_data = {
            "email": "vijay@gmail.com",
            "password": "test123"
        }
        
        print(f"Sending: {json.dumps(login_data, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("\n✓ Login Successful!")
            data = response.json()
            print(f"Token: {data['access_token'][:50]}...")
        else:
            print("\n✗ Login Failed!")
    else:
        print("\n✗ Registration Failed!")
        
except requests.exceptions.ConnectionError:
    print("\n✗ Error: Cannot connect to server!")
    print("Make sure the server is running on http://127.0.0.1:8000")
except Exception as e:
    print(f"\n✗ Error: {str(e)}")
