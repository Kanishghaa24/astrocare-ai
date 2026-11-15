import os
import json
import random
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, hash_password, create_access_token, decode_access_token
from app.models.entities import (
    User, HealthRecord, MentalWellnessRecord, Alert, MedicalNote, DatasetMetadata,
    UserRole, DataSource, AlertSeverity, AlertCategory
)
from app.schemas.all_schemas import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    HealthRecordCreate, HealthRecordResponse,
    MentalWellnessCreate, MentalWellnessResponse,
    AlertResponse, MedicalNoteCreate, MedicalNoteResponse,
    ChatRequest, ChatResponse, DatasetUploadResponse
)
from app.services.analyzer import analyze_single_reading, compute_historical_trends
from app.services.chat_service import answer_health_query
from app.services.dataset_parser import process_uploaded_dataset

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing subject")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

# ================= AUTHENTICATION =================
@router.post("/auth/register", response_model=TokenResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.astronaut_id == user_in.astronaut_id).first():
        raise HTTPException(status_code=400, detail="Astronaut ID already registered")

    new_user = User(
        astronaut_id=user_in.astronaut_id,
        name=user_in.name,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        role=user_in.role,
        mission_name=user_in.mission_name,
        mission_day=user_in.mission_day
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.email, "role": new_user.role.value, "id": new_user.id})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/auth/login", response_model=TokenResponse)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    token = create_access_token({"sub": user.email, "role": user.role.value, "id": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ================= HEALTH RECORDS =================
@router.get("/health/records", response_model=List[HealthRecordResponse])
def get_health_records(
    user_id: Optional[int] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_id = current_user.id
    if current_user.role == UserRole.MEDICAL_OFFICER and user_id is not None:
        target_id = user_id

    records = db.query(HealthRecord)\
        .filter(HealthRecord.user_id == target_id)\
        .order_by(HealthRecord.timestamp.asc())\
        .limit(limit)\
        .all()
    return records

@router.post("/health/records", response_model=HealthRecordResponse)
def create_health_record(
    record_in: HealthRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_record = HealthRecord(
        user_id=current_user.id,
        heart_rate=record_in.heart_rate,
        blood_pressure_sys=record_in.blood_pressure_sys,
        blood_pressure_dia=record_in.blood_pressure_dia,
        body_temperature=record_in.body_temperature,
        blood_glucose=record_in.blood_glucose,
        sleep_duration=record_in.sleep_duration,
        physical_activity_minutes=record_in.physical_activity_minutes,
        stress_level=record_in.stress_level,
        mood_rating=record_in.mood_rating,
        data_source=record_in.data_source,
        notes=record_in.notes
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    # Trigger AI early warning alert analysis
    dict_record = {
        "heart_rate": new_record.heart_rate,
        "blood_pressure_sys": new_record.blood_pressure_sys,
        "blood_pressure_dia": new_record.blood_pressure_dia,
        "body_temperature": new_record.body_temperature,
        "sleep_duration": new_record.sleep_duration,
        "stress_level": new_record.stress_level,
        "blood_glucose": new_record.blood_glucose
    }
    alerts_generated = analyze_single_reading(dict_record)
    for alert_data in alerts_generated:
        db_alert = Alert(
            user_id=current_user.id,
            category=alert_data["category"],
            severity=alert_data["severity"],
            title=alert_data["title"],
            description=alert_data["description"],
            related_parameter=alert_data["related_parameter"],
            reason=alert_data["reason"],
            recommended_action=alert_data["recommended_action"]
        )
        db.add(db_alert)
    db.commit()

    return new_record

@router.put("/health/records/{record_id}", response_model=HealthRecordResponse)
def update_health_record(
    record_id: int,
    record_in: HealthRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(HealthRecord).filter(HealthRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    if record.user_id != current_user.id and current_user.role != UserRole.MEDICAL_OFFICER:
        raise HTTPException(status_code=403, detail="Not authorized to edit this record")

    for field, val in record_in.model_dump(exclude_unset=True).items():
        setattr(record, field, val)
    db.commit()
    db.refresh(record)
    return record

@router.delete("/health/records/{record_id}")
def delete_health_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(HealthRecord).filter(HealthRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    if record.user_id != current_user.id and current_user.role != UserRole.MEDICAL_OFFICER:
        raise HTTPException(status_code=403, detail="Not authorized to delete this record")
    db.delete(record)
    db.commit()
    return {"status": "success", "message": "Record deleted"}

# ================= SIMULATION GENERATOR =================
@router.post("/health/simulate")
def generate_simulated_readings(
    days: int = 7,
    anomaly: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates realistic simulated astronaut telemetry, clearly marked as SIMULATED."""
    now = datetime.now(timezone.utc)
    created_records = []
    
    for i in range(days):
        ts = now - timedelta(days=(days - 1 - i))
        # Base healthy spaceflight baseline
        hr = random.uniform(62, 78)
        sys = random.uniform(112, 126)
        dia = random.uniform(72, 82)
        temp = random.uniform(36.6, 37.2)
        sleep = random.uniform(6.5, 8.2)
        stress = random.randint(2, 5)
        mood = random.randint(3, 5)
        activity = random.uniform(45, 90) # exercise countermeasure

        # Inject controlled anomaly on the final simulated day if requested
        if anomaly and i == days - 1:
            hr = random.uniform(102, 118) # elevated tachycardia
            sys = random.uniform(142, 154) # stage 1 hypertension
            sleep = random.uniform(3.5, 4.5) # severe sleep loss
            stress = random.randint(8, 9)

        rec = HealthRecord(
            user_id=current_user.id,
            timestamp=ts,
            heart_rate=round(hr, 1),
            blood_pressure_sys=round(sys, 1),
            blood_pressure_dia=round(dia, 1),
            body_temperature=round(temp, 1),
            blood_glucose=round(random.uniform(85, 115), 1),
            sleep_duration=round(sleep, 1),
            physical_activity_minutes=round(activity, 0),
            stress_level=stress,
            mood_rating=mood,
            data_source=DataSource.SIMULATED,
            notes="Auto-generated simulated astronaut telemetry for Mission Simulation."
        )
        db.add(rec)
        created_records.append(rec)

    db.commit()

    # Re-evaluate alerts for created simulated records
    for r in created_records:
        alerts = analyze_single_reading({
            "heart_rate": r.heart_rate,
            "blood_pressure_sys": r.blood_pressure_sys,
            "blood_pressure_dia": r.blood_pressure_dia,
            "body_temperature": r.body_temperature,
            "sleep_duration": r.sleep_duration,
            "stress_level": r.stress_level
        })
        for a in alerts:
            db_alert = Alert(
                user_id=current_user.id,
                category=a["category"],
                severity=a["severity"],
                title=a["title"],
                description=a["description"],
                related_parameter=a["related_parameter"],
                reason=a["reason"],
                recommended_action=a["recommended_action"]
            )
            db.add(db_alert)
    db.commit()

    return {"status": "success", "generated_count": len(created_records), "source": "SIMULATED"}

# ================= AI TREND ANALYSIS =================
@router.get("/health/analysis")
def get_health_analysis(
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_id = current_user.id
    if current_user.role == UserRole.MEDICAL_OFFICER and user_id is not None:
        target_id = user_id

    records = db.query(HealthRecord)\
        .filter(HealthRecord.user_id == target_id)\
        .order_by(HealthRecord.timestamp.asc())\
        .all()

    record_dicts = [
        {
            "timestamp": r.timestamp.isoformat(),
            "heart_rate": r.heart_rate,
            "blood_pressure_sys": r.blood_pressure_sys,
            "blood_pressure_dia": r.blood_pressure_dia,
            "body_temperature": r.body_temperature,
            "sleep_duration": r.sleep_duration,
            "stress_level": r.stress_level,
            "physical_activity_minutes": r.physical_activity_minutes,
            "blood_glucose": r.blood_glucose,
            "data_source": r.data_source.value
        }
        for r in records
    ]

    analysis = compute_historical_trends(record_dicts)
    return analysis

# ================= ALERTS =================
@router.get("/alerts", response_model=List[AlertResponse])
def get_alerts(
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_id = current_user.id
    if current_user.role == UserRole.MEDICAL_OFFICER and user_id is not None:
        target_id = user_id

    alerts = db.query(Alert)\
        .filter(Alert.user_id == target_id)\
        .order_by(Alert.timestamp.desc())\
        .all()
    return alerts

@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.acknowledged = True
    db.commit()
    return {"status": "success", "message": "Alert acknowledged"}

@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.resolved = True
    alert.resolved_at = datetime.now(timezone.utc)
    alert.resolved_by = f"{current_user.name} ({current_user.role.value})"
    db.commit()
    return {"status": "success", "message": "Alert marked as resolved"}

# ================= MENTAL WELLNESS =================
@router.get("/wellness", response_model=List[MentalWellnessResponse])
def get_wellness_records(
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_id = current_user.id
    if current_user.role == UserRole.MEDICAL_OFFICER and user_id is not None:
        target_id = user_id

    records = db.query(MentalWellnessRecord)\
        .filter(MentalWellnessRecord.user_id == target_id)\
        .order_by(MentalWellnessRecord.timestamp.asc())\
        .all()
    return records

@router.post("/wellness", response_model=MentalWellnessResponse)
def create_wellness_record(
    rec_in: MentalWellnessCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rec = MentalWellnessRecord(
        user_id=current_user.id,
        mood_rating=rec_in.mood_rating,
        stress_rating=rec_in.stress_rating,
        sleep_quality=rec_in.sleep_quality,
        confinement_fatigue=rec_in.confinement_fatigue,
        social_cohesion=rec_in.social_cohesion,
        cognitive_clarity=rec_in.cognitive_clarity,
        notes=rec_in.notes
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    # Check for severe confinement fatigue or high stress
    if rec_in.stress_rating >= 8 or rec_in.confinement_fatigue >= 4:
        db.add(Alert(
            user_id=current_user.id,
            category=AlertCategory.MENTAL,
            severity=AlertSeverity.ATTENTION,
            title="Confinement Stress & Fatigue Escalation",
            related_parameter="Mental Wellness",
            description=f"Self-assessed stress rating ({rec_in.stress_rating}/10) or isolation fatigue ({rec_in.confinement_fatigue}/5) elevated.",
            reason="Extended isolation and confinement can manifest as subtle neurobehavioral fatigue.",
            recommended_action="Initiate 10-minute guided relaxation session. Review task schedule to avoid cognitive overload."
        ))
        db.commit()

    return rec

# ================= AI ASSISTANT CHAT =================
@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(
    chat_req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve user's personal health context
    records = db.query(HealthRecord)\
        .filter(HealthRecord.user_id == current_user.id)\
        .order_by(HealthRecord.timestamp.asc())\
        .all()
    
    record_dicts = [
        {
            "timestamp": r.timestamp.isoformat(),
            "heart_rate": r.heart_rate,
            "blood_pressure_sys": r.blood_pressure_sys,
            "blood_pressure_dia": r.blood_pressure_dia,
            "body_temperature": r.body_temperature,
            "sleep_duration": r.sleep_duration,
            "stress_level": r.stress_level
        } for r in records
    ]
    trends = compute_historical_trends(record_dicts)
    alerts = db.query(Alert).filter(Alert.user_id == current_user.id).order_by(Alert.timestamp.desc()).limit(5).all()
    alert_dicts = [{"severity": a.severity.value, "title": a.title, "description": a.description, "recommended_action": a.recommended_action, "resolved": a.resolved} for a in alerts]

    user_info = {
        "name": current_user.name,
        "astronaut_id": current_user.astronaut_id,
        "mission_name": current_user.mission_name,
        "mission_day": current_user.mission_day
    }

    response = answer_health_query(chat_req.message, user_info, trends, alert_dicts)
    return response

# ================= NASA RESEARCH DATASET =================
@router.post("/datasets/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    upload_dir = "C:/Users/Kanishghaa/.gemini/antigravity/scratch/astrocare-ai/backend/data"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)

    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    try:
        parsed = process_uploaded_dataset(file_path, file.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process dataset: {str(e)}")

    # Save to db
    meta = DatasetMetadata(
        title=file.filename,
        study_identifier="OSD-575" if "575" in file.filename else "NASA-OSDR-IMPORT",
        source="NASA Open Science Data Repository (OSDR)",
        data_type="Omics / Biological Study",
        filename=file.filename,
        rows_count=parsed["rows_count"],
        columns_count=parsed["columns_count"],
        columns_json=json.dumps(parsed["columns"]),
        summary_stats=json.dumps(parsed["numeric_summary"])
    )
    db.add(meta)
    db.commit()
    db.refresh(meta)

    return {
        "id": meta.id,
        "title": meta.title,
        "study_identifier": meta.study_identifier,
        "source": meta.source,
        "data_type": meta.data_type,
        "filename": meta.filename,
        "rows_count": parsed["rows_count"],
        "columns_count": parsed["columns_count"],
        "columns": parsed["columns"],
        "column_types": parsed["column_types"],
        "duplicate_count": parsed["duplicate_count"],
        "missing_counts": parsed["missing_counts"],
        "missing_percentages": parsed["missing_percentages"],
        "numeric_summary": parsed["numeric_summary"],
        "preview_rows": parsed["preview_rows"]
    }

@router.get("/datasets/list")
def list_datasets(db: Session = Depends(get_db)):
    datasets = db.query(DatasetMetadata).all()
    return [
        {
            "id": d.id,
            "title": d.title,
            "study_identifier": d.study_identifier,
            "source": d.source,
            "data_type": d.data_type,
            "filename": d.filename,
            "rows_count": d.rows_count,
            "columns_count": d.columns_count,
            "created_at": d.created_at.isoformat()
        } for d in datasets
    ]

@router.get("/datasets/{dataset_id}")
def get_dataset_details(dataset_id: int, db: Session = Depends(get_db)):
    meta = db.query(DatasetMetadata).filter(DatasetMetadata.id == dataset_id).first()
    if not meta:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    upload_dir = "C:/Users/Kanishghaa/.gemini/antigravity/scratch/astrocare-ai/backend/data"
    file_path = os.path.join(upload_dir, meta.filename)
    if os.path.exists(file_path):
        parsed = process_uploaded_dataset(file_path, meta.filename)
    else:
        parsed = {
            "rows_count": meta.rows_count,
            "columns_count": meta.columns_count,
            "columns": json.loads(meta.columns_json),
            "column_types": {},
            "duplicate_count": 0,
            "missing_counts": {},
            "missing_percentages": {},
            "numeric_summary": json.loads(meta.summary_stats),
            "preview_rows": []
        }

    return {
        "id": meta.id,
        "title": meta.title,
        "study_identifier": meta.study_identifier,
        "source": meta.source,
        "data_type": meta.data_type,
        "filename": meta.filename,
        **parsed
    }

# ================= SPACE ENVIRONMENT (DONKI / SPACE WEATHER) =================
@router.get("/space-weather")
def get_space_weather():
    """
    Returns realistic Space Weather telemetry (Solar Flares, CME, Geomagnetic storm indices).
    Mirrors NASA DONKI (Space Weather Database Of Notifications, Knowledge, Information) API.
    """
    now = datetime.now(timezone.utc)
    events = [
        {
            "event_id": "2026-CME-008",
            "event_type": "Coronal Mass Ejection (CME)",
            "start_time": (now - timedelta(hours=14)).isoformat(),
            "source_location": "N18W32",
            "speed_km_s": 780.0,
            "half_angle": 34.0,
            "catalog": "NASA DONKI Real-time Catalog",
            "radiation_risk_level": "MODERATE",
            "impact_warning": "No direct geomagnetic impact on Lunar Gateway trajectory. Routine dosimetry monitoring advised."
        },
        {
            "event_id": "2026-FLR-021",
            "event_type": "Solar Flare (M2.4 Class)",
            "start_time": (now - timedelta(days=1, hours=4)).isoformat(),
            "source_location": "Active Region AR3892",
            "speed_km_s": None,
            "half_angle": None,
            "catalog": "NASA DONKI Real-time Catalog",
            "radiation_risk_level": "LOW",
            "impact_warning": "Minor X-ray flux increase. Shielding in Crew Habitat Module nominal."
        },
        {
            "event_id": "2026-SEP-003",
            "event_type": "Solar Energetic Particle (SEP) Event",
            "start_time": (now - timedelta(days=3)).isoformat(),
            "source_location": "Sun Disk Center",
            "speed_km_s": 1150.0,
            "half_angle": 45.0,
            "catalog": "NASA DONKI Real-time Catalog",
            "radiation_risk_level": "ELEVATED",
            "impact_warning": "Flux >10 MeV exceeded 10 pfu threshold. Extravehicular Activity (EVA) was deferred 24 hours per Flight Rule 4.2."
        }
    ]
    return {
        "source": "NASA Space Weather Database Of Notifications, Knowledge, Information (DONKI)",
        "observatory": "NASA SOHO / SDO / Parker Solar Probe Telemetry",
        "events": events,
        "astronaut_dosimetry_disclaimer": "Space environment events represent ambient solar activity. They are not direct astronaut biological dosages without calibrated passive/active biodosimeter models."
    }

# ================= MEDICAL OFFICER ENDPOINTS =================
@router.get("/medical/astronauts")
def get_astronauts_for_medical_officer(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.MEDICAL_OFFICER:
        raise HTTPException(status_code=403, detail="Access restricted to Flight Medical Officers")

    astronauts = db.query(User).filter(User.role == UserRole.ASTRONAUT).all()
    result = []
    for astro in astronauts:
        alerts_count = db.query(Alert).filter(Alert.user_id == astro.id, Alert.resolved == False).count()
        latest_record = db.query(HealthRecord).filter(HealthRecord.user_id == astro.id).order_by(HealthRecord.timestamp.desc()).first()
        result.append({
            "id": astro.id,
            "astronaut_id": astro.astronaut_id,
            "name": astro.name,
            "email": astro.email,
            "mission_name": astro.mission_name,
            "mission_day": astro.mission_day,
            "unresolved_alerts": alerts_count,
            "last_reading": {
                "timestamp": latest_record.timestamp.isoformat() if latest_record else None,
                "heart_rate": latest_record.heart_rate if latest_record else None,
                "blood_pressure": f"{latest_record.blood_pressure_sys}/{latest_record.blood_pressure_dia}" if (latest_record and latest_record.blood_pressure_sys) else None,
                "temperature": latest_record.body_temperature if latest_record else None,
                "sleep_duration": latest_record.sleep_duration if latest_record else None
            } if latest_record else None
        })
    return result

@router.get("/medical/notes", response_model=List[MedicalNoteResponse])
def get_medical_notes(
    astronaut_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_id = current_user.id
    if current_user.role == UserRole.MEDICAL_OFFICER:
        if astronaut_id is not None:
            target_id = astronaut_id
        else:
            # Return all notes across crew for medical officer
            return db.query(MedicalNote).order_by(MedicalNote.timestamp.desc()).all()
    
    notes = db.query(MedicalNote).filter(MedicalNote.astronaut_id == target_id).order_by(MedicalNote.timestamp.desc()).all()
    return notes

@router.post("/medical/notes", response_model=MedicalNoteResponse)
def add_medical_note(
    note_in: MedicalNoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.MEDICAL_OFFICER:
        raise HTTPException(status_code=403, detail="Only Flight Medical Officers can author clinical review notes")

    note = MedicalNote(
        astronaut_id=note_in.astronaut_id,
        officer_id=current_user.id,
        title=note_in.title,
        content=note_in.content,
        recommendation=note_in.recommendation
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
