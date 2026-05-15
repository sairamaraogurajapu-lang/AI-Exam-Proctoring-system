import requests
import json

BASE_URL = "http://127.0.0.1:8000"

print("Testing Registration...")
register_data = {
    "email": "testuser@example.com",
    "full_name": "Test User",
    "password": "test123",
    "student_id": "TEST001",
    "department": "Engineering",
    "year": 2024
}

response = requests.post(
    f"{BASE_URL}/api/auth/register",
    json=register_data,
    headers={"Content-Type": "application/json"}
)

print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
print()

if response.status_code == 201:
    print("Testing Login...")
    login_data = {
        "email": "testuser@example.com",
        "password": "test123"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")