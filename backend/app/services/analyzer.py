from typing import List, Dict, Any, Optional
import numpy as np
from app.models.entities import AlertCategory, AlertSeverity

# Medical reference thresholds for spaceflight operational monitoring (Non-diagnostic)
# Sources: NASA Flight Surgeon guidelines, AHA standards
THRESHOLDS = {
    "heart_rate": {"min_normal": 55, "max_normal": 95, "critical_low": 45, "critical_high": 115, "unit": "bpm"},
    "blood_pressure_sys": {"min_normal": 95, "max_normal": 135, "critical_low": 85, "critical_high": 150, "unit": "mmHg"},
    "blood_pressure_dia": {"min_normal": 60, "max_normal": 88, "critical_low": 50, "critical_high": 98, "unit": "mmHg"},
    "body_temperature": {"min_normal": 36.2, "max_normal": 37.6, "critical_low": 35.5, "critical_high": 38.3, "unit": "°C"},
    "sleep_duration": {"min_normal": 6.5, "max_normal": 9.0, "critical_low": 4.5, "critical_high": 11.0, "unit": "hours"},
    "blood_glucose": {"min_normal": 70, "max_normal": 130, "critical_low": 60, "critical_high": 180, "unit": "mg/dL"},
    "stress_level": {"max_normal": 6, "critical_high": 8, "unit": "/10"}
}

def analyze_single_reading(reading: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Evaluates rule-based health thresholds on a single reading (non-diagnostic support)."""
    alerts = []
    
    # 1. Heart rate
    hr = reading.get("heart_rate")
    if hr is not None:
        if hr > THRESHOLDS["heart_rate"]["critical_high"]:
            alerts.append({
                "category": AlertCategory.CARDIOVASCULAR,
                "severity": AlertSeverity.URGENT,
                "title": "Elevated Heart Rate Spikes Detected",
                "related_parameter": "Heart Rate",
                "description": f"Resting Heart Rate of {hr} bpm exceeds standard high threshold ({THRESHOLDS['heart_rate']['critical_high']} bpm).",
                "reason": "Elevated cardiac frequency during resting status may indicate elevated stress, fluid shift redistribution, or dehydration.",
                "recommended_action": "Contact the Flight Medical Officer immediately. Initiate resting hydration protocol and perform a 10-minute ECG recording."
            })
        elif hr > THRESHOLDS["heart_rate"]["max_normal"]:
            alerts.append({
                "category": AlertCategory.CARDIOVASCULAR,
                "severity": AlertSeverity.ATTENTION,
                "title": "Heart Rate Elevated Above Nominal Baseline",
                "related_parameter": "Heart Rate",
                "description": f"Heart Rate of {hr} bpm is moderately above normal reference range.",
                "reason": "Moderate elevation could stem from intense physical EVA tasks or caffeine consumption.",
                "recommended_action": "Monitor trend over the next 4 hours. Schedule a 15-minute rest period."
            })
        elif hr < THRESHOLDS["heart_rate"]["critical_low"]:
            alerts.append({
                "category": AlertCategory.CARDIOVASCULAR,
                "severity": AlertSeverity.URGENT,
                "title": "Pronounced Bradycardia Observed",
                "related_parameter": "Heart Rate",
                "description": f"Heart Rate of {hr} bpm is below safety limit ({THRESHOLDS['heart_rate']['critical_low']} bpm).",
                "reason": "Cardiac output drop in microgravity requires verification.",
                "recommended_action": "Follow approved mission medical protocol: alert Medical Officer and repeat vitals verification."
            })

    # 2. Blood pressure
    sys = reading.get("blood_pressure_sys")
    dia = reading.get("blood_pressure_dia")
    if sys is not None and dia is not None:
        if sys > THRESHOLDS["blood_pressure_sys"]["critical_high"] or dia > THRESHOLDS["blood_pressure_dia"]["critical_high"]:
            alerts.append({
                "category": AlertCategory.CARDIOVASCULAR,
                "severity": AlertSeverity.URGENT,
                "title": "Hypertensive Reading Discrepancy",
                "related_parameter": "Blood Pressure",
                "description": f"Recorded Blood Pressure: {sys}/{dia} mmHg. Significantly elevated beyond nominal operating limits.",
                "reason": "Microgravity cephalic fluid shift can transiently modify cranial and arterial vascular resistance.",
                "recommended_action": "Notify Flight Medical Officer. Recheck cuff positioning and take repeat measurement after 15 min rest."
            })
        elif sys > THRESHOLDS["blood_pressure_sys"]["max_normal"] or dia > THRESHOLDS["blood_pressure_dia"]["max_normal"]:
            alerts.append({
                "category": AlertCategory.CARDIOVASCULAR,
                "severity": AlertSeverity.ATTENTION,
                "title": "Mild Hypertension Detected",
                "related_parameter": "Blood Pressure",
                "description": f"Recorded Blood Pressure: {sys}/{dia} mmHg exceeds nominal standard bounds.",
                "reason": "May correlate with mission operational workload or sleep disruption.",
                "recommended_action": "Log dietary sodium intake and hydrate adequately."
            })

    # 3. Body Temperature
    temp = reading.get("body_temperature")
    if temp is not None:
        if temp > THRESHOLDS["body_temperature"]["critical_high"]:
            alerts.append({
                "category": AlertCategory.PHYSICAL,
                "severity": AlertSeverity.URGENT,
                "title": "Core Temperature Spike (Pyrexia)",
                "related_parameter": "Body Temperature",
                "description": f"Recorded core temperature: {temp}°C indicates acute fever threshold.",
                "reason": "Astronaut core body temperature increases ~1°C in microgravity ('space fever'). Readings >38.3°C necessitate immediate medical review.",
                "recommended_action": "Notify Medical Officer. Inspect for localized infection symptoms and measure atmospheric cabin air quality."
            })
        elif temp < THRESHOLDS["body_temperature"]["critical_low"]:
            alerts.append({
                "category": AlertCategory.PHYSICAL,
                "severity": AlertSeverity.ATTENTION,
                "title": "Hypothermic Core Temperature Reading",
                "related_parameter": "Body Temperature",
                "description": f"Recorded core temperature: {temp}°C is below normal baseline.",
                "reason": "Could be caused by peripheral sensor placement error or environmental cold exposure in the airlock module.",
                "recommended_action": "Recheck sensor placement, adjust thermal suit layers, and repeat reading."
            })

    # 4. Sleep duration
    sleep = reading.get("sleep_duration")
    if sleep is not None:
        if sleep < THRESHOLDS["sleep_duration"]["critical_low"]:
            alerts.append({
                "category": AlertCategory.SLEEP,
                "severity": AlertSeverity.ATTENTION,
                "title": "Severe Sleep Deprivation Alert",
                "related_parameter": "Sleep Duration",
                "description": f"Logged sleep duration of {sleep} hours is critically insufficient for mission cognitive performance.",
                "reason": "Consecutive circadian disruptions in low Earth or lunar orbit degrade reaction times and psychomotor alertness.",
                "recommended_action": "Schedule sleep hygiene review. Contact medical officer if sleep disturbances persist across >2 mission days."
            })

    # 5. Stress level
    stress = reading.get("stress_level")
    if stress is not None and stress >= THRESHOLDS["stress_level"]["critical_high"]:
        alerts.append({
            "category": AlertCategory.MENTAL,
            "severity": AlertSeverity.ATTENTION,
            "title": "Elevated Subjective Stress Index",
            "related_parameter": "Stress Level",
            "description": f"Self-reported stress level is {stress}/10.",
            "reason": "High mission workload, confinement, and crew cabin tasks can cause cumulative cognitive fatigue.",
            "recommended_action": "Utilize AstroCare guided 5-minute breathing module. Consider scheduling private conference with Flight Surgeon."
        })

    return alerts

def compute_historical_trends(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Computes statistical baselines, trend directions, anomalies, and data completeness."""
    if not records:
        return {
            "status": "No historical data available",
            "data_quality_score": 0,
            "metrics": {},
            "overall_wellness": "Nominal Baseline"
        }

    # Sort chronological
    sorted_records = sorted(records, key=lambda x: str(x.get("timestamp", "")))
    
    metrics_keys = [
        "heart_rate", "blood_pressure_sys", "blood_pressure_dia", 
        "body_temperature", "sleep_duration", "stress_level", "physical_activity_minutes"
    ]
    
    analysis_results = {}
    missing_count = 0
    total_expected = len(sorted_records) * len(metrics_keys)

    for key in metrics_keys:
        values = [r[key] for r in sorted_records if r.get(key) is not None]
        if not values:
            missing_count += len(sorted_records)
            analysis_results[key] = {
                "available": False,
                "status": "Missing",
                "message": "No readings logged in the observation window."
            }
            continue

        missing_count += (len(sorted_records) - len(values))
        arr = np.array(values, dtype=float)
        mean_val = float(np.mean(arr))
        std_val = float(np.std(arr)) if len(arr) > 1 else 0.0
        latest_val = float(values[-1])
        prev_val = float(values[-2]) if len(values) > 1 else latest_val

        # Trend direction
        diff = latest_val - prev_val
        if abs(diff) < 0.05 * (mean_val if mean_val != 0 else 1):
            trend_direction = "stable"
        elif diff > 0:
            trend_direction = "increasing"
        else:
            trend_direction = "decreasing"

        # Statistical anomaly (> 2.0 std from personal baseline mean)
        is_anomaly = False
        z_score = 0.0
        if std_val > 0.01:
            z_score = float((latest_val - mean_val) / std_val)
            if abs(z_score) >= 2.0:
                is_anomaly = True

        status = "normal"
        if is_anomaly:
            status = "needs_attention" if abs(z_score) < 2.8 else "urgent_review"

        analysis_results[key] = {
            "available": True,
            "latest": round(latest_val, 2),
            "previous": round(prev_val, 2),
            "baseline_mean": round(mean_val, 2),
            "baseline_std": round(std_val, 2),
            "z_score": round(z_score, 2),
            "trend_direction": trend_direction,
            "is_anomaly": is_anomaly,
            "status": status,
            "count": len(values)
        }

    data_completeness = round(((total_expected - missing_count) / max(1, total_expected)) * 100, 1)

    # Calculate overall wellness label (strictly non-diagnostic software summary)
    has_urgent = any(m.get("status") == "urgent_review" for m in analysis_results.values() if isinstance(m, dict))
    has_attention = any(m.get("status") == "needs_attention" for m in analysis_results.values() if isinstance(m, dict))

    if has_urgent:
        overall_wellness = "Urgent Review Required"
    elif has_attention:
        overall_wellness = "Attention Advised"
    else:
        overall_wellness = "Nominal Spaceflight Adaptation"

    return {
        "record_count": len(sorted_records),
        "data_completeness_percent": data_completeness,
        "metrics": analysis_results,
        "overall_wellness": overall_wellness,
        "disclaimer": "Non-diagnostic software decision support summary. Consult Flight Surgeon for medical diagnoses."
    }
