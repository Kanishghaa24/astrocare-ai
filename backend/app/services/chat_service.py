from typing import Dict, Any, List

def answer_health_query(query: str, user_profile: Dict[str, Any], health_trends: Dict[str, Any], recent_alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Intelligent space-mission medical decision support conversational agent.
    Grounds answers in authorized health metrics, spaceflight medicine guidelines (NASA/ESA),
    and strictly enforces non-diagnostic decision support disclaimers.
    """
    q_lower = query.lower()
    sources = ["NASA Human Research Program (HRP) Guidelines", "AstroCare AI Biometric Analyzer"]
    
    # 1. Sleep-related queries
    if "sleep" in q_lower:
        sleep_info = health_trends.get("metrics", {}).get("sleep_duration", {})
        latest_sleep = sleep_info.get("latest", "N/A")
        mean_sleep = sleep_info.get("baseline_mean", "N/A")
        trend = sleep_info.get("trend_direction", "nominal")
        
        reply = (
            f"Based on your telemetry, your latest logged sleep duration is **{latest_sleep} hours**, "
            f"compared to your 7-day mission baseline average of **{mean_sleep} hours** (Trend: **{trend}**).\n\n"
            "In orbital environments, sleep architecture commonly shifts due to lack of standard 24-hr circadian sunlight cues, "
            "cabin ambient ventilation noise, and microgravity cephalic fluid pressure.\n\n"
            "**Recommended Protocols:**\n"
            "- Ensure your sleep station light shield is sealed 30 minutes prior to scheduled crew rest.\n"
            "- Engage the AstroCare 5-minute pre-sleep acoustic relaxation module.\n"
            "- If consecutive sleep remains under 5.0 hours, consult the Flight Medical Officer for circadian phase adjustments."
        )
        sources.append("NASA HRP Behavioral Health & Performance Element")

    # 2. Heart rate queries
    elif "heart" in q_lower or "pulse" in q_lower or "bpm" in q_lower:
        hr_info = health_trends.get("metrics", {}).get("heart_rate", {})
        latest_hr = hr_info.get("latest", "N/A")
        mean_hr = hr_info.get("baseline_mean", "N/A")
        z_score = hr_info.get("z_score", 0.0)
        
        reply = (
            f"Your current resting heart rate is logged at **{latest_hr} bpm** (Personal Baseline Mean: **{mean_hr} bpm**, z-score: **{z_score}**).\n\n"
            "During long-duration spaceflight, cardiovascular deconditioning and reduced central venous pressure typically alter resting cardiac dynamics.\n\n"
            "**Guidance:**\n"
            "- Ensure daily countermeasure exercise (ARED resistive workout and T2 cycle ergometer) is completed.\n"
            "- Check hydration status: fluid shifts can induce mild hypovolemia."
        )
        sources.append("NASA Cardiovascular Countermeasures Laboratory")

    # 3. Alert queries
    elif "alert" in q_lower or "warning" in q_lower:
        if recent_alerts:
            unresolved = [a for a in recent_alerts if not a.get("resolved")]
            if unresolved:
                alert_list_str = "\n".join([f"- **[{a.get('severity')}] {a.get('title')}**: {a.get('description')} (Action: {a.get('recommended_action')})" for a in unresolved[:3]])
                reply = (
                    f"You currently have **{len(unresolved)} active notification(s)**:\n\n"
                    f"{alert_list_str}\n\n"
                    "Please review each alert's recommended action in the Alert Center. For any URGENT notifications, initiate contact with Mission Medical Support."
                )
            else:
                reply = "All logged health alerts are currently marked as resolved. Your active telemetry monitoring status is nominal."
        else:
            reply = "No active health alerts are currently flagged on your profile. Vital signs remain within monitored thresholds."
        sources.append("AstroCare Automated Alert Engine")

    # 4. Summary queries
    elif "summary" in q_lower or "daily" in q_lower or "status" in q_lower:
        completeness = health_trends.get("data_completeness_percent", 100)
        overall = health_trends.get("overall_wellness", "Nominal")
        reply = (
            f"**Daily Mission Health Summary (Day {user_profile.get('mission_day', 142)}):**\n"
            f"- **Telemetry Status**: {overall}\n"
            f"- **Data Completeness**: {completeness}%\n"
            f"- **Crew Member**: {user_profile.get('name', 'Astronaut')} ({user_profile.get('astronaut_id', 'ASTRO-01')})\n"
            f"- **Mission**: {user_profile.get('mission_name', 'Ares-V Lunar Gateway')}\n\n"
            "All vital telemetry streams have been analyzed against personal baselines and approved spaceflight health thresholds."
        )

    # 5. Missing measurements
    elif "missing" in q_lower or "incomplete" in q_lower:
        metrics = health_trends.get("metrics", {})
        missing_params = [k.replace('_', ' ').title() for k, v in metrics.items() if not v.get("available")]
        if missing_params:
            reply = (
                f"The following health parameters have missing or incomplete logs for the current mission interval:\n"
                f"- **{', '.join(missing_params)}**\n\n"
                "Please navigate to the **Health Monitoring** module to record manual check-ins or trigger simulated telemetry."
            )
        else:
            reply = "All monitored health parameters have complete data streams logged for the current mission interval."

    # General spaceflight health advice fallback
    else:
        reply = (
            f"Hello Crew Member {user_profile.get('name', '')}. I am AstroCare AI, your mission health decision support assistant.\n\n"
            "I can assist you with:\n"
            "- Explaining your personal vital sign trends (Heart Rate, Blood Pressure, Core Temp)\n"
            "- Clarifying active early warning alerts and flight surgeon protocols\n"
            "- Reviewing sleep architecture, stress levels, and cognitive readiness\n"
            "- Verifying health data completeness\n\n"
            "Feel free to ask questions like: *'Explain my recent heart rate trend'*, *'What does my sleep duration indicate?'*, or *'Give me my daily health summary'*."
        )

    return {
        "reply": reply,
        "sources_consulted": sources,
        "disclaimer": "AstroCare AI provides health information and mission operational decision support only. It does not provide medical diagnoses. For clinical diagnosis or emergencies, follow flight medical protocols and consult the Flight Surgeon."
    }
