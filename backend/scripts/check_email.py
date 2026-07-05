"""
Check email configuration.
Run with: python -m scripts.check_email
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.config import settings
from app.email_service.service import send_email_sync

def check_email_config():
    print("📧 Checking email configuration...\n")
    
    print(f"EMAIL_ENABLED: {settings.EMAIL_ENABLED}")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"EMAIL_USERNAME: {settings.EMAIL_USERNAME}")
    print(f"EMAIL_FROM: {settings.EMAIL_FROM}")
    print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"EMAIL_PASSWORD: {'✓ Set' if settings.EMAIL_PASSWORD else '✗ Not set'}")
    
    if not settings.EMAIL_USERNAME:
        print("\n⚠️ EMAIL_USERNAME is not set. Add it to your .env file.")
        return
    
    if not settings.EMAIL_PASSWORD:
        print("\n⚠️ EMAIL_PASSWORD is not set. Add your Gmail app password to .env file.")
        return
    
    print("\n2️⃣ Testing email sending...")
    success = send_email_sync(
        to_email=settings.EMAIL_USERNAME,  # Send to yourself for testing
        subject="Test Email from AI Assistant",
        body="This is a test email to verify that email sending is working correctly.",
        html_body="""
        <h2>✅ Test Email</h2>
        <p>This is a test email to verify that email sending is working correctly.</p>
        <p>If you're reading this, your email configuration is working!</p>
        """
    )
    
    if success:
        print("✅ Test email sent successfully!")
        print(f"   Check your inbox at: {settings.EMAIL_USERNAME}")
    else:
        print("❌ Failed to send test email.")
        print("   Check your email credentials and try again.")

if __name__ == "__main__":
    check_email_config()