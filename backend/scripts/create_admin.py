"""
Create an admin user.
Run with: python -m scripts.create_admin
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.database.session import AppSessionLocal
from app.database.models import User, UserRole
from app.auth.security import hash_password

def create_admin():
    db = AppSessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if admin:
            print("⚠️ Admin user already exists!")
            print(f"   Email: {admin.email}")
            print(f"   Role: {admin.role.value}")
            return
        
        # Create admin
        admin_user = User(
            email="admin@example.com",
            hashed_password=hash_password("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print("✅ Admin user created successfully!")
        print(f"   Email: {admin_user.email}")
        print(f"   Role: {admin_user.role.value}")
        print("   Password: admin123")
        print("\n⚠️ Please change the password in production!")
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()