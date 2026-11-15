# AstroCare AI
## AI-Powered Astronaut Health Monitoring & Decision Support System
**NASA Space Apps Challenge 2026**

---

### Overview
**AstroCare AI** is a full-stack, responsive space-medical decision support platform designed to monitor astronaut physical and mental health during long-duration orbital and deep-space missions (e.g. Lunar Gateway, Mars transit).

> **Scientific & Medical Governance Disclosure:**
> AstroCare AI is engineered as an **operational clinical decision support system**, not a medically validated diagnostic device. It utilizes personal baseline deviation analysis ($Z$-scores $\pm 2\sigma$), rule-based early warning heuristics, and spaceflight medical guidelines (NASA Human Research Program). It never fabricates NASA data or diagnoses astronauts automatically.

---

### System Architecture
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Recharts.
- **Backend**: FastAPI (Python), Pandas, NumPy, Pydantic, SQLAlchemy ORM.
- **Database**: SQLite with persistent relational schema (`astrocare.db`).
- **Research Integration**: NASA Open Science Data Repository (OSDR) OSD-575 study parser with schema detection and missingness metrics.
- **Space Weather**: NASA DONKI solar event stream emulator.

---

### Quick Start Instructions

#### 1. Start the Backend API (FastAPI)
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API Documentation will be accessible at: `http://127.0.0.1:8000/docs`*

#### 2. Start the Frontend UI (Vite + React)
```bash
cd frontend
npm run dev
```
*Web application interface will be live at: `http://localhost:5173`*

---

### Demo Accounts
Both accounts are pre-seeded into the database with 14 days of realistic mission telemetry:

1. **Astronaut Account**
   - **Email:** `astronaut@nasa.gov`
   - **Password:** `Astro2026!`
   - **Name:** Commander Sarah Chen (`ASTRO-084`)
   - **Role:** Astronaut (Personal telemetry, daily check-in, AI assistant, alerts, guided breathing)

2. **Flight Medical Officer Account**
   - **Email:** `officer@nasa.gov`
   - **Password:** `FlightSurgeon2026!`
   - **Name:** Dr. Marcus Vance (`FLT-SURG-02`)
   - **Role:** Flight Medical Officer (Crew roster, longitudinal analytics, clinical review notes, dataset research oversight)

---

### Key Capabilities & Navigation
1. **Overview Dashboard:** Live vital signs (HR, BP, Temp, Sleep, Stress) with historical sparklines, trend arrows, data source labels (`SIMULATED`, `MANUAL`), and quick simulation tools.
2. **Health Monitoring:** Manual biometric data entry, simulated data generation, inline record editor, and deletion.
3. **AI Health Trend Analyzer:** Statistical $Z$-score anomaly detection against rolling individual baselines and data completeness meters.
4. **Early Warning Alert System:** Multi-severity notifications (`URGENT`, `ATTENTION`, `INFO`) with physiological mechanisms, NASA protocol instructions, acknowledge, and resolve workflows.
5. **Mental Wellness:** Mood check-ins, confinement and isolation fatigue evaluation, and interactive **Spaceflight Box-Breathing (4-4-4-4)** countermeasure timer.
6. **AstroCare AI Assistant:** Biometrically-grounded chat assistant referencing user vitals, sleep deficit, and flight guidelines.
7. **NASA Research Data Center:** Dynamic ingestion of CSV/Excel datasets, featuring SpaceX Inspiration4 (**OSD-575**) immune and cytokine profiles.
8. **Space Environment:** NASA DONKI solar flare and coronal mass ejection monitoring with dosimetry warnings.
9. **Medical Officer Center:** Astronaut profile inspection, multi-crew vitals tracking, and clinical review notes.
10. **Health Analytics & Export:** CSV telemetry export and formatted printable flight health reports.
