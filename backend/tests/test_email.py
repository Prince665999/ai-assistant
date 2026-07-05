"""
Test email integration.
Run with: python -m scripts.test_email
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

import requests
import time
import json

BASE_URL = "http://localhost:8000"

def test_email():
    print("📧 Testing email integration...\n")
    
    # Login
    print("1️⃣ Logging in...")
    login_data = {
        "email": "testuser@example.com",
        "password": "testpassword123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code != 200:
        print("❌ Login failed. Make sure test user exists.")
        return
    
    tokens = response.json()
    access_token = tokens['access_token']
    headers = {"Authorization": f"Bearer {access_token}"}
    print("✅ Logged in successfully\n")
    
    print("2️⃣ Sending a chat message...")
    response = requests.post(
        f"{BASE_URL}/chat/",
        json={"message": "Hello! Can you tell me about the company policies?"},
        headers=headers
    )
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Chat response received:")
        print(f"   Response: {result['response'][:150]}...")
        print(f"   Tool used: {result.get('tool_used', 'None')}")
        print(f"\n📧 An email should be sent to testuser@example.com with this conversation.")
        print("   Check your email inbox (or spam folder) for the message.")
    else:
        print(f"❌ Chat failed: {response.text}")
    
    print("\n✨ Email test complete!")

if __name__ == "__main__":
    test_email()