import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    ASTRONAUT = "astronaut"
    MEDICAL_OFFICER = "medical_officer"

class DataSource(str, enum.Enum):
    MANUAL = "MANUAL"
    SIMULATED = "SIMULATED"
    RESEARCH_IMPORTED = "RESEARCH_IMPORTED"

class AlertSeverity(str, enum.Enum):
    INFO = "INFO"
    ATTENTION = "ATTENTION"
    URGENT = "URGENT"

class AlertCategory(str, enum.Enum):
    PHYSICAL = "PHYSICAL"
    CARDIOVASCULAR = "CARDIOVASCULAR"
    SLEEP = "SLEEP"
    MENTAL = "MENTAL"
    DATA_QUALITY = "DATA_QUALITY"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    astronaut_id = Column(String, unique=True, index=True) # e.g. "ASTRO-084"
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.ASTRONAUT)
    mission_name = Column(String, default="Ares-V Lunar Gateway")
    mission_day = Column(Integer, default=142)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    health_records = relationship("HealthRecord", back_populates="user", cascade="all, delete-orphan")
    wellness_records = relationship("MentalWellnessRecord", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("MedicalNote", foreign_keys="MedicalNote.astronaut_id", back_populates="astronaut", cascade="all, delete-orphan")

class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    # Vital signs
    heart_rate = Column(Float, nullable=True) # bpm
    blood_pressure_sys = Column(Float, nullable=True) # mmHg
    blood_pressure_dia = Column(Float, nullable=True) # mmHg
    body_temperature = Column(Float, nullable=True) # Celsius
    blood_glucose = Column(Float, nullable=True) # mg/dL
    sleep_duration = Column(Float, nullable=True) # hours
    physical_activity_minutes = Column(Float, nullable=True) # active exercise minutes
    
    # Subjective metrics
    stress_level = Column(Integer, nullable=True) # 1-10
    mood_rating = Column(Integer, nullable=True) # 1-5 (1=critical/exhausted, 5=excellent)
    
    data_source = Column(Enum(DataSource), default=DataSource.MANUAL)
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="health_records")

class MentalWellnessRecord(Base):
    __tablename__ = "mental_wellness_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    mood_rating = Column(Integer, nullable=False) # 1-5
    stress_rating = Column(Integer, nullable=False) # 1-10
    sleep_quality = Column(Integer, nullable=False) # 1-5
    confinement_fatigue = Column(Integer, nullable=False) # 1-5
    social_cohesion = Column(Integer, nullable=False) # 1-5
    cognitive_clarity = Column(Integer, nullable=False) # 1-5
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="wellness_records")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    category = Column(Enum(AlertCategory), nullable=False)
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.ATTENTION)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    related_parameter = Column(String, nullable=True) # e.g. "Heart Rate", "Sleep Duration"
    reason = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    
    acknowledged = Column(Boolean, default=False)
    resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String, nullable=True)

    user = relationship("User", back_populates="alerts")

class MedicalNote(Base):
    __tablename__ = "medical_notes"

    id = Column(Integer, primary_key=True, index=True)
    astronaut_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=True)

    astronaut = relationship("User", foreign_keys=[astronaut_id], back_populates="notes")

class DatasetMetadata(Base):
    __tablename__ = "dataset_metadata"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    study_identifier = Column(String, default="OSD-575")
    source = Column(String, default="NASA Open Science Data Repository (OSDR)")
    data_type = Column(String, default="Omics / Biological Assay")
    filename = Column(String, nullable=False)
    rows_count = Column(Integer, default=0)
    columns_count = Column(Integer, default=0)
    columns_json = Column(Text, default="[]") # JSON list of column names
    summary_stats = Column(Text, default="{}") # JSON stats
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
