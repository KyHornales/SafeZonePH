from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Float
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr, Field
from jose import JWTError, jwt
from mangum import Mangum
import os
import hashlib
import secrets
from typing import Optional

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./safezoneph_prod.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", 1440))

security = HTTPBearer()

# Database Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    barangay = Column(String, nullable=True)
    city = Column(String, nullable=True)
    location = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    points = Column(Integer, default=100)
    rank = Column(String, default="Bagong Kaibigan")
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    status = Column(String, default="pending")
    points = Column(Integer, nullable=False)
    due_date = Column(String, nullable=True)
    assigned_to = Column(String, nullable=True)
    location = Column(String, nullable=True)
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class PointsHistory(Base):
    __tablename__ = "points_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    type = Column(String, nullable=False)
    description = Column(String, nullable=False)
    points = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class HelpRequest(Base):
    __tablename__ = "help_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    user_name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    location = Column(String, nullable=False)
    urgency = Column(String, nullable=False)
    status = Column(String, default="open")
    responders_needed = Column(Integer, default=1)
    responders_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class GlobalAlert(Base):
    __tablename__ = "global_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    created_by = Column(String, nullable=False)
    type = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    affected_areas = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    acknowledged_by = Column(String, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)

class CommunityTask(Base):
    __tablename__ = "community_tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    location = Column(String, nullable=False)
    urgency = Column(String, nullable=False)
    points = Column(Integer, nullable=False)
    status = Column(String, default="open")
    volunteers = Column(String, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic Models
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    firstName: str = Field(..., alias='first_name')
    lastName: str = Field(..., alias='last_name')
    phone: Optional[str] = None
    barangay: Optional[str] = None
    city: Optional[str] = None

    class Config:
        populate_by_name = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TaskCreate(BaseModel):
    title: str
    description: str
    category: str
    priority: str
    points: int
    due_date: Optional[str] = None
    assigned_to: Optional[str] = None
    location: Optional[str] = None

class TaskUpdate(BaseModel):
    status: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    points: Optional[int] = None
    due_date: Optional[str] = None

class ProfileUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    phone: Optional[str] = None
    barangay: Optional[str] = None
    city: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None

class HelpRequestCreate(BaseModel):
    type: str
    title: str
    description: str
    location: str
    urgency: str
    responders_needed: int = 1

class GlobalAlertCreate(BaseModel):
    type: str
    priority: str
    title: str
    message: str
    affected_areas: Optional[str] = None

# FastAPI App
app = FastAPI(title="SafeZonePH API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper Functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def calculate_rank(points: int) -> str:
    if points >= 1000:
        return "Pinuno ng Komunidad"
    elif points >= 500:
        return "Bantay Kaibigan"
    elif points >= 250:
        return "Mabuting Kaibigan"
    else:
        return "Bagong Kaibigan"

# API Routes
@app.get("/")
def read_root():
    return {"message": "SafeZonePH API is running on Vercel!"}

@app.post("/api/auth/register")
def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        first_name=user_data.firstName,
        last_name=user_data.lastName,
        phone=user_data.phone,
        barangay=user_data.barangay,
        city=user_data.city,
        points=100,
        rank="Bagong Kaibigan"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    points_entry = PointsHistory(
        user_id=new_user.id,
        type="earned",
        description="Welcome bonus for joining SafeZonePH!",
        points=100
    )
    db.add(points_entry)
    db.commit()

    access_token = create_access_token(data={"sub": new_user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "firstName": new_user.first_name,
            "lastName": new_user.last_name,
            "points": new_user.points,
            "rank": new_user.rank
        }
    }

@app.post("/api/auth/login")
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "phone": user.phone,
            "barangay": user.barangay,
            "city": user.city,
            "location": user.location,
            "bio": user.bio,
            "points": user.points,
            "rank": user.rank
        }
    }

@app.get("/api/auth/me")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "firstName": current_user.first_name,
        "lastName": current_user.last_name,
        "phone": current_user.phone,
        "barangay": current_user.barangay,
        "city": current_user.city,
        "location": current_user.location,
        "bio": current_user.bio,
        "points": current_user.points,
        "rank": current_user.rank
    }

@app.put("/api/profile")
def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.firstName:
        current_user.first_name = profile_data.firstName
    if profile_data.lastName:
        current_user.last_name = profile_data.lastName
    if profile_data.phone:
        current_user.phone = profile_data.phone
    if profile_data.barangay:
        current_user.barangay = profile_data.barangay
    if profile_data.city:
        current_user.city = profile_data.city
    if profile_data.location:
        current_user.location = profile_data.location
    if profile_data.bio:
        current_user.bio = profile_data.bio

    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "email": current_user.email,
        "firstName": current_user.first_name,
        "lastName": current_user.last_name,
        "phone": current_user.phone,
        "barangay": current_user.barangay,
        "city": current_user.city,
        "location": current_user.location,
        "bio": current_user.bio,
        "points": current_user.points,
        "rank": current_user.rank
    }

@app.post("/api/tasks")
def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_task = Task(
        title=task_data.title,
        description=task_data.description,
        category=task_data.category,
        priority=task_data.priority,
        points=task_data.points,
        due_date=task_data.due_date,
        assigned_to=task_data.assigned_to,
        location=task_data.location,
        created_by=current_user.id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {
        "id": new_task.id,
        "title": new_task.title,
        "description": new_task.description,
        "category": new_task.category,
        "priority": new_task.priority,
        "status": new_task.status,
        "points": new_task.points,
        "dueDate": new_task.due_date,
        "assignedTo": new_task.assigned_to,
        "location": new_task.location,
        "createdAt": new_task.created_at.isoformat() if new_task.created_at else None
    }

@app.get("/api/tasks")
def get_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.created_by == current_user.id).all()

    return [
        {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "category": task.category,
            "priority": task.priority,
            "status": task.status,
            "points": task.points,
            "dueDate": task.due_date,
            "assignedTo": task.assigned_to,
            "location": task.location,
            "createdAt": task.created_at.isoformat() if task.created_at else None
        }
        for task in tasks
    ]

@app.put("/api/tasks/{task_id}")
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id, Task.created_by == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    old_status = task.status

    if task_data.status:
        task.status = task_data.status
    if task_data.title:
        task.title = task_data.title
    if task_data.description:
        task.description = task_data.description
    if task_data.category:
        task.category = task_data.category
    if task_data.priority:
        task.priority = task_data.priority
    if task_data.points:
        task.points = task_data.points
    if task_data.due_date:
        task.due_date = task_data.due_date

    db.commit()
    db.refresh(task)

    if old_status != "completed" and task.status == "completed":
        current_user.points += task.points
        current_user.rank = calculate_rank(current_user.points)

        points_entry = PointsHistory(
            user_id=current_user.id,
            type="earned",
            description=f"Completed task: {task.title}",
            points=task.points
        )
        db.add(points_entry)
        db.commit()

    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "category": task.category,
        "priority": task.priority,
        "status": task.status,
        "points": task.points,
        "dueDate": task.due_date,
        "assignedTo": task.assigned_to,
        "location": task.location
    }

@app.delete("/api/tasks/{task_id}")
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id, Task.created_by == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}

@app.get("/api/points/history")
def get_points_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    history = db.query(PointsHistory).filter(PointsHistory.user_id == current_user.id).order_by(PointsHistory.created_at.desc()).all()

    return [
        {
            "id": entry.id,
            "type": entry.type,
            "description": entry.description,
            "points": entry.points,
            "createdAt": entry.created_at.isoformat() if entry.created_at else None
        }
        for entry in history
    ]

@app.post("/api/help-requests")
def create_help_request(
    request_data: HelpRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_request = HelpRequest(
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        type=request_data.type,
        title=request_data.title,
        description=request_data.description,
        location=request_data.location,
        urgency=request_data.urgency,
        responders_needed=request_data.responders_needed
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return {
        "id": new_request.id,
        "userName": new_request.user_name,
        "type": new_request.type,
        "title": new_request.title,
        "description": new_request.description,
        "location": new_request.location,
        "urgency": new_request.urgency,
        "status": new_request.status,
        "respondersNeeded": new_request.responders_needed,
        "respondersCount": new_request.responders_count,
        "createdAt": new_request.created_at.isoformat() if new_request.created_at else None
    }

@app.get("/api/help-requests")
def get_help_requests(db: Session = Depends(get_db)):
    requests = db.query(HelpRequest).order_by(HelpRequest.created_at.desc()).all()

    return [
        {
            "id": req.id,
            "userName": req.user_name,
            "type": req.type,
            "title": req.title,
            "description": req.description,
            "location": req.location,
            "urgency": req.urgency,
            "status": req.status,
            "respondersNeeded": req.responders_needed,
            "respondersCount": req.responders_count,
            "createdAt": req.created_at.isoformat() if req.created_at else None
        }
        for req in requests
    ]

@app.post("/api/global-alerts")
def create_global_alert(
    alert_data: GlobalAlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_alert = GlobalAlert(
        user_id=current_user.id,
        created_by=f"{current_user.first_name} {current_user.last_name}",
        type=alert_data.type,
        priority=alert_data.priority,
        title=alert_data.title,
        message=alert_data.message,
        affected_areas=alert_data.affected_areas or ""
    )

    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    return {
        "id": new_alert.id,
        "createdBy": new_alert.created_by,
        "type": new_alert.type,
        "priority": new_alert.priority,
        "title": new_alert.title,
        "message": new_alert.message,
        "affectedAreas": new_alert.affected_areas,
        "isActive": new_alert.is_active,
        "acknowledgedBy": new_alert.acknowledged_by,
        "createdAt": new_alert.created_at.isoformat() if new_alert.created_at else None
    }

@app.get("/api/global-alerts")
def get_global_alerts(db: Session = Depends(get_db)):
    alerts = db.query(GlobalAlert).order_by(GlobalAlert.created_at.desc()).all()

    return [
        {
            "id": alert.id,
            "createdBy": alert.created_by,
            "type": alert.type,
            "priority": alert.priority,
            "title": alert.title,
            "message": alert.message,
            "affectedAreas": alert.affected_areas,
            "isActive": alert.is_active,
            "acknowledgedBy": alert.acknowledged_by,
            "createdAt": alert.created_at.isoformat() if alert.created_at else None
        }
        for alert in alerts
    ]

@app.put("/api/global-alerts/{alert_id}/acknowledge")
def acknowledge_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(GlobalAlert).filter(GlobalAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    import json
    acknowledged = json.loads(alert.acknowledged_by) if alert.acknowledged_by else []
    user_id = str(current_user.id)

    if user_id not in acknowledged:
        acknowledged.append(user_id)
        alert.acknowledged_by = json.dumps(acknowledged)
        db.commit()

    return {"message": "Alert acknowledged"}

@app.put("/api/global-alerts/{alert_id}/toggle")
def toggle_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(GlobalAlert).filter(GlobalAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_active = not alert.is_active
    db.commit()

    return {"message": f"Alert {'activated' if alert.is_active else 'deactivated'}"}

@app.get("/api/community-tasks")
def get_community_tasks(db: Session = Depends(get_db)):
    tasks = db.query(CommunityTask).order_by(CommunityTask.created_at.desc()).all()

    return [
        {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "location": task.location,
            "urgency": task.urgency,
            "points": task.points,
            "status": task.status,
            "volunteers": task.volunteers,
            "createdAt": task.created_at.isoformat() if task.created_at else None
        }
        for task in tasks
    ]

@app.post("/api/community-tasks/{task_id}/volunteer")
def volunteer_for_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    community_task = db.query(CommunityTask).filter(CommunityTask.id == task_id).first()
    if not community_task:
        raise HTTPException(status_code=404, detail="Community task not found")

    import json
    volunteers = json.loads(community_task.volunteers) if community_task.volunteers else []
    user_id = str(current_user.id)

    if user_id in volunteers:
        raise HTTPException(status_code=400, detail="You have already volunteered for this task")

    volunteers.append(user_id)
    community_task.volunteers = json.dumps(volunteers)

    personal_task = Task(
        title=community_task.title,
        description=community_task.description,
        category="community",
        priority=community_task.urgency,
        points=community_task.points,
        location=community_task.location,
        created_by=current_user.id,
        status="pending"
    )
    db.add(personal_task)

    db.commit()

    return {"message": "Successfully volunteered! Task added to your personal tasks."}

@app.post("/api/seed-community-tasks")
def seed_community_tasks(db: Session = Depends(get_db)):
    existing_count = db.query(CommunityTask).count()
    if existing_count > 0:
        return {"message": f"Database already has {existing_count} community tasks"}

    initial_tasks = [
        CommunityTask(
            title="Emergency Supplies for Lola Rosa",
            description="Requiring immediate delivery of maintenance medication and drinking water.",
            location="Brgy. Malolos, Sector 3",
            urgency="high",
            points=75,
            status="open"
        ),
        CommunityTask(
            title="Elderly Wellness Check",
            description="Verify medicine stockpile and secondary power supply for Mrs. Reyes.",
            location="Quezon City, Zone 2",
            urgency="medium",
            points=50,
            status="open"
        ),
        CommunityTask(
            title="Community Center Cleanup",
            description="Assistance needed to organize the donation intake area for tomorrow's relief drive.",
            location="Brgy. Hall Multi-Purpose",
            urgency="low",
            points=35,
            status="open"
        ),
    ]

    for task in initial_tasks:
        db.add(task)

    db.commit()
    return {"message": f"Successfully created {len(initial_tasks)} community tasks"}

# Vercel serverless handler
handler = Mangum(app)
