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

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, nullable=False)
    user2_id = Column(Integer, nullable=False)
    last_message = Column(String, nullable=True)
    last_message_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, nullable=False)
    sender_id = Column(Integer, nullable=False)
    receiver_id = Column(Integer, nullable=False)
    content = Column(String, nullable=False)
    read = Column(Boolean, default=False)
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

# Message Schemas
class MessageCreate(BaseModel):
    receiver_id: int
    content: str

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    receiver_id: int
    content: str
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: int
    participant_id: int
    participant_name: str
    participant_email: str
    last_message: Optional[str]
    last_message_at: datetime
    unread_count: int

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
    
    # Save old status BEFORE updating
    old_status = task.status

    # Update task fields
    for field, value in task_update.dict(exclude_unset=True).items():
        setattr(task, field, value)

    # If task was just completed (status changed from non-completed to completed), award points
    if task_update.status == "completed" and old_status != "completed":
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
    db.refresh(task)
    
    # Return the updated task
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "category": task.category,
        "priority": task.priority,
        "status": task.status,
        "points": task.points,
        "dueDate": task.due_date.isoformat() if task.due_date else None,
        "assignedTo": task.assigned_to,
        "location": task.location,
        "createdAt": task.created_at.isoformat() if task.created_at else None
    }

# Points History Endpoint
@app.get("/api/points/history")
def get_points_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get points history for the current user"""
    history = db.query(PointsHistory).filter(
        PointsHistory.user_id == current_user.id
    ).order_by(PointsHistory.created_at.desc()).all()
    
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

# ==========================================
# BUDDY CHECK-IN & NOTIFICATION SYSTEM
# ==========================================

class BuddySession(Base):
    __tablename__ = "buddy_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    buddy_id = Column(Integer, nullable=False)
    status = Column(String, default="active")  # active, completed, emergency
    check_in_interval = Column(Integer, default=30)  # minutes
    last_check_in = Column(DateTime, default=datetime.utcnow)
    location = Column(String, nullable=True)
    destination = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    type = Column(String, nullable=False)  # buddy_request, check_in_reminder, missed_check_in, emergency, system
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    related_id = Column(Integer, nullable=True)  # Related buddy session, task, etc.
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create the new tables
BuddySession.__table__.create(bind=engine, checkfirst=True)
Notification.__table__.create(bind=engine, checkfirst=True)

# Pydantic models for buddy system
class BuddySessionCreate(BaseModel):
    buddy_id: int
    check_in_interval: int = 30
    location: Optional[str] = None
    destination: Optional[str] = None

class NotificationCreate(BaseModel):
    type: str
    title: str
    message: str
    related_id: Optional[int] = None

# Buddy Session Endpoints
@app.post("/api/buddy/sessions")
def create_buddy_session(
    session_data: BuddySessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new buddy session"""
    # Check if buddy exists
    buddy = db.query(User).filter(User.id == session_data.buddy_id).first()
    if not buddy:
        raise HTTPException(status_code=404, detail="Buddy not found")
    
    # Create session
    new_session = BuddySession(
        user_id=current_user.id,
        buddy_id=session_data.buddy_id,
        check_in_interval=session_data.check_in_interval,
        location=session_data.location,
        destination=session_data.destination
    )
    db.add(new_session)
    
    # Notify buddy
    notification = Notification(
        user_id=session_data.buddy_id,
        type="buddy_request",
        title="New Buddy Session Started",
        message=f"{current_user.first_name} {current_user.last_name} has started a buddy session with you.",
        related_id=new_session.id
    )
    db.add(notification)
    
    db.commit()
    db.refresh(new_session)
    
    return {
        "id": new_session.id,
        "userId": new_session.user_id,
        "buddyId": new_session.buddy_id,
        "status": new_session.status,
        "checkInInterval": new_session.check_in_interval,
        "lastCheckIn": new_session.last_check_in.isoformat() if new_session.last_check_in else None,
        "location": new_session.location,
        "destination": new_session.destination,
        "createdAt": new_session.created_at.isoformat() if new_session.created_at else None
    }

@app.get("/api/buddy/sessions")
def get_buddy_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all buddy sessions for current user"""
    sessions = db.query(BuddySession).filter(
        (BuddySession.user_id == current_user.id) | (BuddySession.buddy_id == current_user.id)
    ).order_by(BuddySession.created_at.desc()).all()
    
    result = []
    for s in sessions:
        # Get buddy info
        if s.user_id == current_user.id:
            other_user = db.query(User).filter(User.id == s.buddy_id).first()
            role = "initiator"
        else:
            other_user = db.query(User).filter(User.id == s.user_id).first()
            role = "buddy"
        
        result.append({
            "id": s.id,
            "role": role,
            "buddyName": f"{other_user.first_name} {other_user.last_name}" if other_user else "Unknown",
            "buddyId": other_user.id if other_user else None,
            "status": s.status,
            "checkInInterval": s.check_in_interval,
            "lastCheckIn": s.last_check_in.isoformat() if s.last_check_in else None,
            "location": s.location,
            "destination": s.destination,
            "createdAt": s.created_at.isoformat() if s.created_at else None
        })
    
    return result

@app.get("/api/buddy/sessions/active")
def get_active_buddy_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get currently active buddy session"""
    session = db.query(BuddySession).filter(
        ((BuddySession.user_id == current_user.id) | (BuddySession.buddy_id == current_user.id)),
        BuddySession.status == "active"
    ).first()
    
    if not session:
        return None
    
    # Get buddy info
    if session.user_id == current_user.id:
        buddy = db.query(User).filter(User.id == session.buddy_id).first()
        role = "initiator"
    else:
        buddy = db.query(User).filter(User.id == session.user_id).first()
        role = "buddy"
    
    return {
        "id": session.id,
        "role": role,
        "buddyName": f"{buddy.first_name} {buddy.last_name}" if buddy else "Unknown",
        "buddyId": buddy.id if buddy else None,
        "status": session.status,
        "checkInInterval": session.check_in_interval,
        "lastCheckIn": session.last_check_in.isoformat() if session.last_check_in else None,
        "location": session.location,
        "destination": session.destination,
        "createdAt": session.created_at.isoformat() if session.created_at else None
    }

@app.post("/api/buddy/sessions/{session_id}/check-in")
def buddy_check_in(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Perform a check-in for a buddy session"""
    session = db.query(BuddySession).filter(BuddySession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.user_id != current_user.id and session.buddy_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized for this session")
    
    if session.status != "active":
        raise HTTPException(status_code=400, detail="Session is not active")
    
    # Update last check-in time
    session.last_check_in = datetime.utcnow()
    
    # Get buddy to notify
    buddy_id = session.buddy_id if session.user_id == current_user.id else session.user_id
    
    # Notify buddy of check-in
    notification = Notification(
        user_id=buddy_id,
        type="check_in_success",
        title="Buddy Checked In",
        message=f"{current_user.first_name} has checked in safely.",
        related_id=session_id
    )
    db.add(notification)
    
    # Award points for regular check-ins
    current_user.points += 5
    points_entry = PointsHistory(
        user_id=current_user.id,
        type="buddy_check_in",
        description="Regular buddy check-in",
        points=5
    )
    db.add(points_entry)
    
    db.commit()
    
    return {
        "message": "Check-in successful",
        "lastCheckIn": session.last_check_in.isoformat(),
        "pointsEarned": 5
    }

@app.post("/api/buddy/sessions/{session_id}/missed")
def missed_check_in(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Report a missed check-in (triggers notifications)"""
    session = db.query(BuddySession).filter(BuddySession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Determine who missed and who to notify
    if session.user_id == current_user.id:
        missed_user = current_user
        buddy_id = session.buddy_id
    else:
        missed_user = db.query(User).filter(User.id == session.user_id).first()
        buddy_id = session.buddy_id if session.buddy_id != current_user.id else session.user_id
    
    # Create urgent notification for buddy
    notification = Notification(
        user_id=buddy_id,
        type="missed_check_in",
        title="⚠️ Missed Check-In Alert",
        message=f"{missed_user.first_name} {missed_user.last_name} missed their check-in! Please try to contact them.",
        related_id=session_id
    )
    db.add(notification)
    db.commit()
    
    return {"message": "Missed check-in reported", "notificationSent": True}

@app.post("/api/buddy/sessions/{session_id}/emergency")
def buddy_emergency(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Trigger emergency for a buddy session"""
    session = db.query(BuddySession).filter(BuddySession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.status = "emergency"
    
    # Notify buddy
    buddy_id = session.buddy_id if session.user_id == current_user.id else session.user_id
    
    notification = Notification(
        user_id=buddy_id,
        type="emergency",
        title="🚨 EMERGENCY ALERT",
        message=f"{current_user.first_name} {current_user.last_name} triggered an emergency! Last known location: {session.location or 'Unknown'}",
        related_id=session_id
    )
    db.add(notification)
    db.commit()
    
    return {"message": "Emergency triggered", "sessionStatus": "emergency"}

@app.post("/api/buddy/sessions/{session_id}/end")
def end_buddy_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """End a buddy session"""
    session = db.query(BuddySession).filter(BuddySession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.user_id != current_user.id and session.buddy_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized for this session")
    
    session.status = "completed"
    session.ended_at = datetime.utcnow()
    
    # Notify buddy
    buddy_id = session.buddy_id if session.user_id == current_user.id else session.user_id
    
    notification = Notification(
        user_id=buddy_id,
        type="session_ended",
        title="Buddy Session Ended",
        message=f"{current_user.first_name} has ended the buddy session safely.",
        related_id=session_id
    )
    db.add(notification)
    
    # Award completion points
    current_user.points += 25
    points_entry = PointsHistory(
        user_id=current_user.id,
        type="buddy_session_completed",
        description="Completed buddy session",
        points=25
    )
    db.add(points_entry)
    
    db.commit()
    
    return {"message": "Session ended successfully", "pointsEarned": 25}

# Notification Endpoints
@app.get("/api/notifications")
def get_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all notifications for current user"""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = query.order_by(Notification.created_at.desc()).limit(50).all()
    
    return [
        {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "relatedId": n.related_id,
            "isRead": n.is_read,
            "createdAt": n.created_at.isoformat() if n.created_at else None
        }
        for n in notifications
    ]

@app.get("/api/notifications/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get count of unread notifications"""
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    return {"unreadCount": count}

@app.put("/api/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}

@app.put("/api/notifications/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read"""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    
    return {"message": "All notifications marked as read"}

@app.post("/api/notifications")
def create_notification(
    notification_data: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a notification (for system use)"""
    notification = Notification(
        user_id=current_user.id,
        type=notification_data.type,
        title=notification_data.title,
        message=notification_data.message,
        related_id=notification_data.related_id
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return {
        "id": notification.id,
        "type": notification.type,
        "title": notification.title,
        "message": notification.message,
        "createdAt": notification.created_at.isoformat() if notification.created_at else None
    }

# ===== MESSAGING ENDPOINTS =====

@app.get("/api/conversations", response_model=list[ConversationResponse])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all conversations for the current user"""
    # Find all conversations where user is participant
    conversations_data = []
    
    # Get conversations where user is user1
    convs1 = db.query(Conversation).filter(Conversation.user1_id == current_user.id).all()
    # Get conversations where user is user2
    convs2 = db.query(Conversation).filter(Conversation.user2_id == current_user.id).all()
    
    all_convs = convs1 + convs2
    
    for conv in all_convs:
        # Determine the other participant
        participant_id = conv.user2_id if conv.user1_id == current_user.id else conv.user1_id
        participant = db.query(User).filter(User.id == participant_id).first()
        
        if not participant:
            continue
        
        # Count unread messages
        unread_count = db.query(Message).filter(
            Message.conversation_id == conv.id,
            Message.receiver_id == current_user.id,
            Message.read == False
        ).count()
        
        conversations_data.append({
            "id": conv.id,
            "participant_id": participant.id,
            "participant_name": f"{participant.first_name} {participant.last_name}",
            "participant_email": participant.email,
            "last_message": conv.last_message,
            "last_message_at": conv.last_message_at,
            "unread_count": unread_count
        })
    
    # Sort by last message time
    conversations_data.sort(key=lambda x: x["last_message_at"], reverse=True)
    
    return conversations_data

@app.get("/api/conversations/{user_id}/messages", response_model=list[MessageResponse])
def get_conversation_messages(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all messages in a conversation with a specific user"""
    # Find or create conversation
    conversation = db.query(Conversation).filter(
        ((Conversation.user1_id == current_user.id) & (Conversation.user2_id == user_id)) |
        ((Conversation.user1_id == user_id) & (Conversation.user2_id == current_user.id))
    ).first()
    
    if not conversation:
        # Create new conversation
        conversation = Conversation(
            user1_id=current_user.id,
            user2_id=user_id,
            last_message=None
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return []
    
    # Get all messages in this conversation
    messages = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(Message.created_at).all()
    
    # Mark messages as read
    db.query(Message).filter(
        Message.conversation_id == conversation.id,
        Message.receiver_id == current_user.id,
        Message.read == False
    ).update({"read": True})
    db.commit()
    
    return messages

@app.post("/api/messages", response_model=MessageResponse)
def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to another user"""
    # Verify receiver exists
    receiver = db.query(User).filter(User.id == message_data.receiver_id).first()
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver not found"
        )
    
    # Find or create conversation
    conversation = db.query(Conversation).filter(
        ((Conversation.user1_id == current_user.id) & (Conversation.user2_id == message_data.receiver_id)) |
        ((Conversation.user1_id == message_data.receiver_id) & (Conversation.user2_id == current_user.id))
    ).first()
    
    if not conversation:
        conversation = Conversation(
            user1_id=current_user.id,
            user2_id=message_data.receiver_id,
            last_message=message_data.content[:100],
            last_message_at=datetime.utcnow()
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
    else:
        # Update conversation
        conversation.last_message = message_data.content[:100]
        conversation.last_message_at = datetime.utcnow()
        db.commit()
    
    # Create message
    message = Message(
        conversation_id=conversation.id,
        sender_id=current_user.id,
        receiver_id=message_data.receiver_id,
        content=message_data.content,
        read=False
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # Create notification for receiver
    notification = Notification(
        user_id=message_data.receiver_id,
        type="message",
        title="New Message",
        message=f"{current_user.first_name} {current_user.last_name} sent you a message",
        related_id=str(conversation.id)
    )
    db.add(notification)
    db.commit()
    
    return message

@app.get("/api/users/buddies")
def get_buddies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all users (potential buddies) for messaging"""
    users = db.query(User).filter(User.id != current_user.id).all()
    
    return [{
        "id": user.id,
        "name": f"{user.first_name} {user.last_name}",
        "email": user.email,
        "location": user.location,
        "points": user.points,
        "rank": user.rank
    } for user in users]

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", 8000)),
        reload=bool(os.getenv("DEBUG", False))
    )