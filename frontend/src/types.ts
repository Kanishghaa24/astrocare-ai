export interface User {
  id: number;
  astronaut_id: string;
  name: string;
  email: string;
  role: 'astronaut' | 'medical_officer';
  mission_name: string;
  mission_day: number;
  created_at: string;
}

export interface HealthRecord {
  id: number;
  user_id: number;
  timestamp: string;
  heart_rate?: number;
  blood_pressure_sys?: number;
  blood_pressure_dia?: number;
  body_temperature?: number;
  blood_glucose?: number;
  sleep_duration?: number;
  physical_activity_minutes?: number;
  stress_level?: number;
  mood_rating?: number;
  data_source: 'MANUAL' | 'SIMULATED' | 'RESEARCH_IMPORTED';
  notes?: string;
}

export interface MentalWellnessRecord {
  id: number;
  user_id: number;
  timestamp: string;
  mood_rating: number;
  stress_rating: number;
  sleep_quality: number;
  confinement_fatigue: number;
  social_cohesion: number;
  cognitive_clarity: number;
  notes?: string;
}

export interface Alert {
  id: number;
  user_id: number;
  timestamp: string;
  category: 'PHYSICAL' | 'CARDIOVASCULAR' | 'SLEEP' | 'MENTAL' | 'DATA_QUALITY';
  severity: 'INFO' | 'ATTENTION' | 'URGENT';
  title: string;
  description: string;
  related_parameter?: string;
  reason: string;
  recommended_action: string;
  acknowledged: boolean;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

export interface HealthAnalysis {
  record_count: number;
  data_completeness_percent: number;
  metrics: Record<string, {
    available: boolean;
    latest?: number;
    previous?: number;
    baseline_mean?: number;
    baseline_std?: number;
    z_score?: number;
    trend_direction?: string;
    is_anomaly?: boolean;
    status?: string;
    message?: string;
  }>;
  overall_wellness: string;
  disclaimer: string;
}

export interface DatasetDetails {
  id: number;
  title: string;
  study_identifier: string;
  source: string;
  data_type: string;
  filename: string;
  rows_count: number;
  columns_count: number;
  columns: string[];
  column_types: Record<string, string>;
  duplicate_count: number;
  missing_counts: Record<string, number>;
  missing_percentages: Record<string, number>;
  numeric_summary: Record<string, {
    mean: number;
    std: number;
    min: number;
    max: number;
    median: number;
  }>;
  preview_rows: Record<string, any>[];
}

export interface SpaceWeatherEvent {
  event_id: string;
  event_type: string;
  start_time: string;
  source_location: string;
  speed_km_s?: number;
  half_angle?: number;
  catalog: string;
  radiation_risk_level: string;
  impact_warning: string;
}
