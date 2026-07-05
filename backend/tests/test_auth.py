"""
Test authentication flow.
Run with: python -m scripts.test_auth
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

import requests
import json

BASE_URL = "http://localhost:8000"

def test_auth_flow():
    print("🔐 Testing authentication flow...\n")
    
    # 1. Register a new user
    print("1️⃣ Registering new user...")
    register_data = {
        "email": "testuser@example.com",
        "password": "testpassword123"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    if response.status_code == 201:
        print(f"✅ User registered: {response.json()['email']}")
        user_id = response.json()['id']
    elif response.status_code == 400 and "already registered" in response.json()['detail']:
        print("ℹ️ User already exists, proceeding to login")
        user_id = None
    else:
        print(f"❌ Registration failed: {response.text}")
        return
    
    # 2. Login
    print("\n2️⃣ Logging in...")
    login_data = {
        "email": "testuser@example.com",
        "password": "testpassword123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        tokens = response.json()
        access_token = tokens['access_token']
        refresh_token = tokens['refresh_token']
        print(f"✅ Login successful")
        print(f"   Access token: {access_token[:30]}...")
        print(f"   Refresh token: {refresh_token[:30]}...")
    else:
        print(f"❌ Login failed: {response.text}")
        return
    
    # 3. Get current user info
    print("\n3️⃣ Getting current user info...")
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    if response.status_code == 200:
        user_data = response.json()
        print(f"✅ Current user: {user_data['email']} (Role: {user_data['role']})")
    else:
        print(f"❌ Failed to get user info: {response.text}")
    
    # 4. Refresh token
    print("\n4️⃣ Refreshing tokens...")
    refresh_data = {"refresh_token": refresh_token}
    response = requests.post(f"{BASE_URL}/auth/refresh", json=refresh_data)
    if response.status_code == 200:
        new_tokens = response.json()
        print(f"✅ Token refresh successful")
        print(f"   New access token: {new_tokens['access_token'][:30]}...")
        print(f"   New refresh token: {new_tokens['refresh_token'][:30]}...")
        # Update tokens for logout test
        refresh_token = new_tokens['refresh_token']
    else:
        print(f"❌ Token refresh failed: {response.text}")
    
    # 5. Logout
    print("\n5️⃣ Logging out...")
    logout_data = {"refresh_token": refresh_token}
    response = requests.post(f"{BASE_URL}/auth/logout", json=logout_data, headers=headers)
    if response.status_code == 204:
        print("✅ Logout successful")
    else:
        print(f"❌ Logout failed: {response.text}")
    
    # 6. Try to use revoked refresh token (should fail)
    print("\n6️⃣ Testing revoked refresh token...")
    refresh_data = {"refresh_token": refresh_token}
    response = requests.post(f"{BASE_URL}/auth/refresh", json=refresh_data)
    if response.status_code == 401:
        print("✅ Refresh token correctly rejected (revoked)")
    else:
        print(f"❌ Unexpected response: {response.status_code} - {response.text}")
    
    print("\n✨ Auth flow testing complete!")

if __name__ == "__main__":
    test_auth_flow()