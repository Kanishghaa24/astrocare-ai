import os
import json
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.routes import router as api_router
from app.models.entities import User, UserRole, HealthRecord, Alert, DataSource, AlertCategory, AlertSeverity, DatasetMetadata
from app.core.security import hash_password
from app.services.sample_data import generate_sample_osd575
from app.services.dataset_parser import process_uploaded_dataset

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AstroCare AI: Astronaut Health Monitoring & Clinical Decision Support System (NASA Space Apps Challenge 2026)"
)

# CORS middleware for seamless Vite frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def init_seed_data():
    """Seeds default demo accounts and NASA OSD-575 study dataset if empty."""
    db = SessionLocal()
    try:
        # 1. Seed Astronaut Demo
        astro_user = db.query(User).filter(User.email == "astronaut@nasa.gov").first()
        if not astro_user:
            astro_user = User(
                astronaut_id="ASTRO-084",
                name="Commander Sarah Chen",
                email="astronaut@nasa.gov",
                hashed_password=hash_password("Astro2026!"),
                role=UserRole.ASTRONAUT,
                mission_name="Ares-V Lunar Gateway",
                mission_day=142
            )
            db.add(astro_user)
            db.commit()
            db.refresh(astro_user)

            # Seed 14 days of realistic baseline records
            now = datetime.now(timezone.utc)
            for i in range(14):
                ts = now - timedelta(days=(13 - i))
                # Introduce slight sleep drop and heart rate fluctuation towards recent days
                hr = 68.0 + (i * 0.8) + (2.0 if i % 2 == 0 else -1.5)
                sys = 118.0 + (i * 0.5)
                dia = 76.0 + (i * 0.3)
                temp = 36.8 + (0.1 if i > 10 else 0.0)
                sleep = 7.5 - (0.18 * i) # gradual sleep compression in space
                stress = min(8, 3 + (i // 3))
                mood = max(2, 5 - (i // 4))

                rec = HealthRecord(
                    user_id=astro_user.id,
                    timestamp=ts,
                    heart_rate=round(hr, 1),
                    blood_pressure_sys=round(sys, 1),
                    blood_pressure_dia=round(dia, 1),
                    body_temperature=round(temp, 1),
                    blood_glucose=94.0,
                    sleep_duration=round(sleep, 1),
                    physical_activity_minutes=60.0,
                    stress_level=stress,
                    mood_rating=mood,
                    data_source=DataSource.SIMULATED,
                    notes=f"Mission Day {129 + i} routine morning biometric scan (SIMULATED)."
                )
                db.add(rec)

            # Seed early warning alerts for demo
            db.add(Alert(
                user_id=astro_user.id,
                category=AlertCategory.SLEEP,
                severity=AlertSeverity.ATTENTION,
                title="Circadian Sleep Compression Detected",
                description="Consecutive 3-day sleep duration has decreased by 22% relative to your 14-day pre-mission baseline.",
                related_parameter="Sleep Duration",
                reason="Statistical trend indicates negative slope in deep sleep window.",
                recommended_action="Review cabin ambient light schedule; utilize blue-blocker visor 60 mins before bunk rest."
            ))

            db.add(Alert(
                user_id=astro_user.id,
                category=AlertCategory.CARDIOVASCULAR,
                severity=AlertSeverity.INFO,
                title="Resting Heart Rate Mild Upward Trend",
                description="Resting heart rate mean increased from 68 bpm to 78 bpm over the past 10 mission days.",
                related_parameter="Heart Rate",
                reason="Normal cardiovascular adaptation to microgravity fluid redistribution, but warrants monitoring.",
                recommended_action="Maintain daily 2.5-hour scheduled countermeasure resistance exercises."
            ))
            db.commit()

        # 2. Seed Flight Medical Officer Demo
        officer = db.query(User).filter(User.email == "officer@nasa.gov").first()
        if not officer:
            officer = User(
                astronaut_id="FLT-SURG-02",
                name="Dr. Marcus Vance (Flight Surgeon)",
                email="officer@nasa.gov",
                hashed_password=hash_password("FlightSurgeon2026!"),
                role=UserRole.MEDICAL_OFFICER,
                mission_name="Mission Control Medical Directorate",
                mission_day=142
            )
            db.add(officer)
            db.commit()

        # 3. Seed NASA OSD-575 Inspiration4 Dataset
        osd_dataset = db.query(DatasetMetadata).filter(DatasetMetadata.study_identifier == "OSD-575").first()
        if not osd_dataset:
            osd_dir = "C:/Users/Kanishghaa/.gemini/antigravity/scratch/astrocare-ai/backend/data"
            os.makedirs(osd_dir, exist_ok=True)
            csv_path = os.path.join(osd_dir, "NASA_OSD_575_Inspiration4_sample.csv")
            if not os.path.exists(csv_path):
                generate_sample_osd575(csv_path)

            parsed = process_uploaded_dataset(csv_path, "NASA_OSD_575_Inspiration4_sample.csv")
            meta = DatasetMetadata(
                title="NASA OSD-575 Inspiration4 Crew Immune & Cytokine Profiling",
                study_identifier="OSD-575",
                source="NASA Open Science Data Repository (OSDR)",
                data_type="Single-cell Immune Repertoire & Cytokine Panel",
                filename="NASA_OSD_575_Inspiration4_sample.csv",
                rows_count=parsed["rows_count"],
                columns_count=parsed["columns_count"],
                columns_json=json.dumps(parsed["columns"]),
                summary_stats=json.dumps(parsed["numeric_summary"])
            )
            db.add(meta)
            db.commit()

    finally:
        db.close()

@app.get("/")
def root():
    return {
        "project": "AstroCare AI",
        "description": "AI-Powered Astronaut Health Monitoring & Decision Support System",
        "challenge": "NASA Space Apps Challenge 2026",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
