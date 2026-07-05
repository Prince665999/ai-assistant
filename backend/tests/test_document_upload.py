"""
Test document upload and RAG pipeline.
Run with: python -m scripts.test_document_upload
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

import requests
import time

BASE_URL = "http://localhost:8000"

def test_document_upload():
    print("📄 Testing document upload and RAG pipeline...\n")
    
    # First, login to get token
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
    
    # Create a sample text file
    print("2️⃣ Creating sample text file...")
    sample_content = """
    Artificial Intelligence (AI) is transforming the world.
    
    Machine Learning is a subset of AI that enables systems to learn from data.
    
    Deep Learning uses neural networks with many layers to solve complex problems.
    
    Natural Language Processing (NLP) helps computers understand human language.
    
    Computer Vision allows machines to interpret and understand visual information.
    
    AI applications include chatbots, recommendation systems, and autonomous vehicles.
    
    The future of AI includes advances in general intelligence and ethical AI.
    """
    
    with open("sample.txt", "w") as f:
        f.write(sample_content)
    print("✅ Sample file created: sample.txt\n")
    
    # Upload document
    print("3️⃣ Uploading document...")
    with open("sample.txt", "rb") as f:
        files = {"file": ("sample.txt", f, "text/plain")}
        response = requests.post(
            f"{BASE_URL}/documents/upload",
            files=files,
            headers=headers
        )
    
    if response.status_code != 200:
        print(f"❌ Upload failed: {response.text}")
        return
    
    result = response.json()
    print(f"✅ Document uploaded successfully!")
    print(f"   Document ID: {result['id']}")
    print(f"   Filename: {result['filename']}")
    print(f"   Status: {result['status']}")
    print(f"   Message: {result['message']}\n")
    
    document_id = result['id']
    
    # Wait for processing
    print("4️⃣ Waiting for processing (5 seconds)...")
    time.sleep(5)
    
    # Check document status
    print("5️⃣ Checking document status...")
    response = requests.get(
        f"{BASE_URL}/documents/{document_id}",
        headers=headers
    )
    
    if response.status_code == 200:
        doc = response.json()
        print(f"✅ Document details:")
        print(f"   ID: {doc['id']}")
        print(f"   Filename: {doc['filename']}")
        print(f"   Status: {doc['status']}")
        print(f"   Chunks: {doc['chunk_count']}")
        if doc['error_message']:
            print(f"   Error: {doc['error_message']}")
    else:
        print(f"❌ Failed to get document: {response.text}")
    
    # Test RAG search
    print("\n6️⃣ Testing RAG search...")
    # We'll test this in the next step (Step 10) when we implement tool calling
    print("ℹ️ RAG search will be tested in Step 10 (Tool Calling)")
    
    # Clean up
    import os
    if os.path.exists("sample.txt"):
        os.remove("sample.txt")
        print("\n✅ Cleaned up sample file")
    
    print("\n✨ Document upload test complete!")

if __name__ == "__main__":
    test_document_upload()