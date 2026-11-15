from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.models.entities import UserRole, DataSource, AlertSeverity, AlertCategory

# User schemas
class UserBase(BaseModel):
    astronaut_id: str
    name: str
    email: str
    role: UserRole = UserRole.ASTRONAUT
    mission_name: str = "Ares-V Lunar Gateway"
    mission_day: int = 142

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Health Record schemas
class HealthRecordBase(BaseModel):
    heart_rate: Optional[float] = None
    blood_pressure_sys: Optional[float] = None
    blood_pressure_dia: Optional[float] = None
    body_temperature: Optional[float] = None
    blood_glucose: Optional[float] = None
    sleep_duration: Optional[float] = None
    physical_activity_minutes: Optional[float] = None
    stress_level: Optional[int] = None
    mood_rating: Optional[int] = None
    data_source: DataSource = DataSource.MANUAL
    notes: Optional[str] = None

class HealthRecordCreate(HealthRecordBase):
    pass

class HealthRecordResponse(HealthRecordBase):
    id: int
    user_id: int
    timestamp: datetime
    class Config:
        from_attributes = True

# Mental Wellness schemas
class MentalWellnessCreate(BaseModel):
    mood_rating: int
    stress_rating: int
    sleep_quality: int
    confinement_fatigue: int
    social_cohesion: int
    cognitive_clarity: int
    notes: Optional[str] = None

class MentalWellnessResponse(MentalWellnessCreate):
    id: int
    user_id: int
    timestamp: datetime
    class Config:
        from_attributes = True

# Alert schemas
class AlertBase(BaseModel):
    category: AlertCategory
    severity: AlertSeverity
    title: str
    description: str
    related_parameter: Optional[str] = None
    reason: str
    recommended_action: str

class AlertResponse(AlertBase):
    id: int
    user_id: int
    timestamp: datetime
    acknowledged: bool
    resolved: bool
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    class Config:
        from_attributes = True

# Medical Note
class MedicalNoteCreate(BaseModel):
    astronaut_id: int
    title: str
    content: str
    recommendation: Optional[str] = None

class MedicalNoteResponse(BaseModel):
    id: int
    astronaut_id: int
    officer_id: int
    timestamp: datetime
    title: str
    content: str
    recommendation: Optional[str] = None
    class Config:
        from_attributes = True

# Chatbot
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str
    sources_consulted: List[str]
    disclaimer: str

# NASA Dataset
class DatasetUploadResponse(BaseModel):
    id: int
    title: str
    study_identifier: str
    source: str
    data_type: str
    filename: str
    rows_count: int
    columns_count: int
    columns: List[str]
    summary_stats: Dict[str, Any]
    preview_rows: List[Dict[str, Any]]
