from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database.session import AppSessionLocal
from app.database.models import User, UserRole
from app.auth.security import hash_password

router = APIRouter(prefix="/admin-setup", tags=["admin-setup"])

class AdminCreate(BaseModel):
    email: str
    password: str

@router.post("/create-admin")
def create_admin(admin_data: AdminCreate):
    db = AppSessionLocal()
    try:
        existing = db.query(User).filter(User.email == admin_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Admin already exists")
        
        admin = User(
            email=admin_data.email,
            hashed_password=hash_password(admin_data.password),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        db.commit()
        return {"message": "Admin created successfully", "email": admin_data.email}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()