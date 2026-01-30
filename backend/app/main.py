from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Float
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr, Field
from jose import JWTError, jwt
import os
import hashlib
import secrets
from dotenv import load_dotenv
from typing import Optional
import uvicorn

load_dotenv()

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./safezoneph_dev.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
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
    type = Column(String, nullable=False)  # safety, escort, emergency, general
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    location = Column(String, nullable=False)
    urgency = Column(String, nullable=False)  # low, normal, high, critical
    status = Column(String, default="open")  # open, in_progress, resolved
    responders_needed = Column(Integer, default=1)
    responders_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class GlobalAlert(Base):
    __tablename__ = "global_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    created_by = Column(String, nullable=False)
    type = Column(String, nullable=False)  # emergency, weather, community, safety, resource
    priority = Column(String, nullable=False)  # low, medium, high, critical
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    affected_areas = Column(String, nullable=False)  # JSON array as string
    is_active = Column(Boolean, default=True)
    acknowledged_count = Column(Integer, default=0)
    expires_at = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class CommunityTask(Base):
    __tablename__ = "community_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    location = Column(String, nullable=False)
    urgency = Column(String, nullable=False)  # low, medium, high
    points = Column(Integer, default=50)
    status = Column(String, default="open")  # open, assigned, completed
    volunteer_id = Column(Integer, nullable=True)
    volunteer_name = Column(String, nullable=True)
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str = Field(..., alias='firstName')
    last_name: str = Field(..., alias='lastName')
    phone: Optional[str] = None
    barangay: Optional[str] = None
    city: Optional[str] = None

    class Config:
        populate_by_name = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    barangay: Optional[str]
    city: Optional[str]
    location: Optional[str]
    bio: Optional[str]
    points: int
    rank: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

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
    assigned_to: Optional[str] = None
    location: Optional[str] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    priority: str
    status: str
    points: int
    due_date: Optional[str]
    assigned_to: Optional[str]
    location: Optional[str]
    created_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

# Help Request Schemas
class HelpRequestCreate(BaseModel):
    type: str
    title: str
    description: str
    location: str
    urgency: str
    responders_needed: int = 1

class HelpRequestResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    type: str
    title: str
    description: str
    location: str
    urgency: str
    status: str
    responders_needed: int
    responders_count: int
    created_at: datetime

    class Config:
        from_attributes = True

# Global Alert Schemas
class GlobalAlertCreate(BaseModel):
    type: str
    priority: str
    title: str
    message: str
    affected_areas: list[str]
    expires_in: Optional[str] = "24"

class GlobalAlertResponse(BaseModel):
    id: int
    user_id: int
    created_by: str
    type: str
    priority: str
    title: str
    message: str
    affected_areas: str
    is_active: bool
    acknowledged_count: int
    expires_at: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Community Task Schemas
class CommunityTaskCreate(BaseModel):
    title: str
    description: str
    location: str
    urgency: str
    points: int = 50

class CommunityTaskResponse(BaseModel):
    id: int
    title: str
    description: str
    location: str
    urgency: str
    points: int
    status: str
    volunteer_id: Optional[int]
    volunteer_name: Optional[str]
    created_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

# FastAPI App
app = FastAPI(title="SafeZonePH API", version="1.0.0")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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

# Utility Functions
def verify_password(plain_password, hashed_password):
    # Simple password verification using stored salt
    try:
        stored_hash, salt = hashed_password.split(':')
        password_hash = hashlib.sha256((plain_password + salt).encode()).hexdigest()
        return password_hash == stored_hash
    except:
        return False

def get_password_hash(password):
    # Simple password hashing with salt
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{password_hash}:{salt}"

def calculate_rank(points: int) -> str:
    rank_tiers = [
        {"name": "Bagong Kaibigan", "min_points": 0},
        {"name": "Lingkod Kapwa", "min_points": 250},
        {"name": "Kapit-Bisig Hero", "min_points": 500},
        {"name": "Bayanihan Champion", "min_points": 1000},
        {"name": "Community Guardian", "min_points": 2000},
        {"name": "SafeZone Legend", "min_points": 5000},
    ]
    
    for i in range(len(rank_tiers) - 1, -1, -1):
        if points >= rank_tiers[i]["min_points"]:
            return rank_tiers[i]["name"]
    return rank_tiers[0]["name"]

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# API Endpoints
@app.post("/api/auth/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    location = f"{user_data.barangay}, {user_data.city}" if user_data.barangay and user_data.city else None
    
    db_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        barangay=user_data.barangay,
        city=user_data.city,
        location=location,
        hashed_password=hashed_password,
        points=100,  # Welcome points
        rank=calculate_rank(100)
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Add welcome points to history
    points_entry = PointsHistory(
        user_id=db_user.id,
        type="bonus",
        description="Welcome to SafeZonePH! Thank you for joining our community.",
        points=100
    )
    db.add(points_entry)
    db.commit()
    
    # Create access token
    access_token = create_access_token(data={"sub": db_user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(db_user)
    }

@app.post("/api/auth/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user)
    }

@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse.from_orm(current_user)

@app.get("/api/tasks")
def get_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    return [TaskResponse.from_orm(task) for task in tasks]

@app.post("/api/tasks", response_model=TaskResponse)
def create_task(task_data: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_task = Task(
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
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    return TaskResponse.from_orm(db_task)

@app.patch("/api/tasks/{task_id}")
def update_task(task_id: int, task_update: TaskUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update task fields
    for field, value in task_update.dict(exclude_unset=True).items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    
    # If task was completed, award points
    if task_update.status == "completed" and task.status != "completed":
        current_user.points += task.points
        current_user.rank = calculate_rank(current_user.points)
        
        # Add to points history
        points_entry = PointsHistory(
            user_id=current_user.id,
            type="task_completed",
            description=f"Completed task: {task.title}",
            points=task.points
        )
        db.add(points_entry)
        db.commit()
    
    return TaskResponse.from_orm(task)

@app.get("/api/points/history")
def get_points_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    history = db.query(PointsHistory).filter(PointsHistory.user_id == current_user.id).order_by(PointsHistory.created_at.desc()).all()
    return [
        {
            "id": entry.id,
            "type": entry.type,
            "description": entry.description,
            "points": entry.points,
            "timestamp": entry.created_at.isoformat(),
            "date": entry.created_at.date().isoformat()
        }
        for entry in history
    ]

# Help Request Endpoints
@app.get("/api/help-requests")
def get_help_requests(db: Session = Depends(get_db)):
    requests = db.query(HelpRequest).order_by(HelpRequest.created_at.desc()).all()
    return [HelpRequestResponse.from_orm(req) for req in requests]

@app.post("/api/help-requests", response_model=HelpRequestResponse)
def create_help_request(request_data: HelpRequestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_request = HelpRequest(
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        type=request_data.type,
        title=request_data.title,
        description=request_data.description,
        location=request_data.location,
        urgency=request_data.urgency,
        responders_needed=request_data.responders_needed
    )
    
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    return HelpRequestResponse.from_orm(db_request)

@app.patch("/api/help-requests/{request_id}/respond")
def respond_to_help_request(request_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    help_request = db.query(HelpRequest).filter(HelpRequest.id == request_id).first()
    if not help_request:
        raise HTTPException(status_code=404, detail="Help request not found")
    
    help_request.responders_count += 1
    if help_request.responders_count >= help_request.responders_needed:
        help_request.status = "in_progress"
    
    db.commit()
    db.refresh(help_request)
    
    # Award points for responding
    current_user.points += 25
    current_user.rank = calculate_rank(current_user.points)
    
    points_entry = PointsHistory(
        user_id=current_user.id,
        type="help_response",
        description=f"Responded to help request: {help_request.title}",
        points=25
    )
    db.add(points_entry)
    db.commit()
    
    return {"message": "Response recorded", "request": HelpRequestResponse.from_orm(help_request)}

# Global Alert Endpoints
@app.get("/api/global-alerts")
def get_global_alerts(db: Session = Depends(get_db)):
    alerts = db.query(GlobalAlert).order_by(GlobalAlert.created_at.desc()).all()
    return [GlobalAlertResponse.from_orm(alert) for alert in alerts]

@app.post("/api/global-alerts", response_model=GlobalAlertResponse)
def create_global_alert(alert_data: GlobalAlertCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    import json
    db_alert = GlobalAlert(
        user_id=current_user.id,
        created_by=f"{current_user.first_name} {current_user.last_name}",
        type=alert_data.type,
        priority=alert_data.priority,
        title=alert_data.title,
        message=alert_data.message,
        affected_areas=json.dumps(alert_data.affected_areas),
        expires_at=f"{alert_data.expires_in} hours" if alert_data.expires_in else None
    )
    
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    
    return GlobalAlertResponse.from_orm(db_alert)

@app.patch("/api/global-alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(GlobalAlert).filter(GlobalAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.acknowledged_count += 1
    db.commit()
    db.refresh(alert)
    
    return {"message": "Alert acknowledged", "alert": GlobalAlertResponse.from_orm(alert)}

@app.patch("/api/global-alerts/{alert_id}/toggle")
def toggle_alert_status(alert_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(GlobalAlert).filter(GlobalAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_active = not alert.is_active
    db.commit()
    db.refresh(alert)
    
    return {"message": "Alert status toggled", "alert": GlobalAlertResponse.from_orm(alert)}

# Community Tasks Endpoints
@app.get("/api/community-tasks")
def get_community_tasks(db: Session = Depends(get_db)):
    tasks = db.query(CommunityTask).filter(CommunityTask.status == "open").order_by(CommunityTask.created_at.desc()).all()
    return [CommunityTaskResponse.from_orm(task) for task in tasks]

@app.post("/api/community-tasks", response_model=CommunityTaskResponse)
def create_community_task(task_data: CommunityTaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_task = CommunityTask(
        title=task_data.title,
        description=task_data.description,
        location=task_data.location,
        urgency=task_data.urgency,
        points=task_data.points,
        created_by=current_user.id
    )
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    return CommunityTaskResponse.from_orm(db_task)

@app.post("/api/community-tasks/{task_id}/volunteer")
def volunteer_for_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    community_task = db.query(CommunityTask).filter(CommunityTask.id == task_id).first()
    if not community_task:
        raise HTTPException(status_code=404, detail="Community task not found")
    
    if community_task.status != "open":
        raise HTTPException(status_code=400, detail="Task is no longer available")
    
    # Mark community task as assigned
    community_task.status = "assigned"
    community_task.volunteer_id = current_user.id
    community_task.volunteer_name = f"{current_user.first_name} {current_user.last_name}"
    
    # Create a personal task for the user
    personal_task = Task(
        title=community_task.title,
        description=community_task.description,
        category="community_event",
        priority="medium" if community_task.urgency == "medium" else ("high" if community_task.urgency == "high" else "low"),
        points=community_task.points,
        location=community_task.location,
        status="pending",
        assigned_to=f"{current_user.first_name} {current_user.last_name}",
        created_by=current_user.id
    )
    
    db.add(personal_task)
    db.commit()
    db.refresh(community_task)
    db.refresh(personal_task)
    
    return {
        "message": "Successfully volunteered for task",
        "community_task": CommunityTaskResponse.from_orm(community_task),
        "personal_task": TaskResponse.from_orm(personal_task)
    }

@app.get("/")
def read_root():
    return {"message": "SafeZonePH API is running!"}

@app.post("/api/seed-community-tasks")
def seed_community_tasks(db: Session = Depends(get_db)):
    """Seed initial community tasks if none exist"""
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

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", 8000)),
        reload=bool(os.getenv("DEBUG", False))
    )