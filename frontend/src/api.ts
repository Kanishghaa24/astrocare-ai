import { User, HealthRecord, Alert, MentalWellnessRecord, HealthAnalysis, DatasetDetails, SpaceWeatherEvent } from './types';

const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('astrocare_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('astrocare_token', data.access_token);
    return data;
  },

  async register(userData: any): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('astrocare_token', data.access_token);
    return data;
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  logout() {
    localStorage.removeItem('astrocare_token');
  },

  // Health records
  async getHealthRecords(userId?: number): Promise<HealthRecord[]> {
    const url = userId ? `${API_BASE}/health/records?user_id=${userId}` : `${API_BASE}/health/records`;
    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to load health records');
    return res.json();
  },

  async createHealthRecord(record: Partial<HealthRecord>): Promise<HealthRecord> {
    const res = await fetch(`${API_BASE}/health/records`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error('Failed to save health record');
    return res.json();
  },

  async updateHealthRecord(id: number, record: Partial<HealthRecord>): Promise<HealthRecord> {
    const res = await fetch(`${API_BASE}/health/records/${id}`, {
      method: 'PUT',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error('Failed to update record');
    return res.json();
  },

  async deleteHealthRecord(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/health/records/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to delete record');
  },

  async simulateReadings(days = 7, anomaly = false): Promise<any> {
    const res = await fetch(`${API_BASE}/health/simulate?days=${days}&anomaly=${anomaly}`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Simulation failed');
    return res.json();
  },

  // Analysis & Alerts
  async getHealthAnalysis(userId?: number): Promise<HealthAnalysis> {
    const url = userId ? `${API_BASE}/health/analysis?user_id=${userId}` : `${API_BASE}/health/analysis`;
    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Analysis retrieval failed');
    return res.json();
  },

  async getAlerts(userId?: number): Promise<Alert[]> {
    const url = userId ? `${API_BASE}/alerts?user_id=${userId}` : `${API_BASE}/alerts`;
    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async acknowledgeAlert(alertId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to acknowledge alert');
  },

  async resolveAlert(alertId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to resolve alert');
  },

  // Mental wellness
  async getWellness(userId?: number): Promise<MentalWellnessRecord[]> {
    const url = userId ? `${API_BASE}/wellness?user_id=${userId}` : `${API_BASE}/wellness`;
    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch wellness records');
    return res.json();
  },

  async createWellness(record: Partial<MentalWellnessRecord>): Promise<MentalWellnessRecord> {
    const res = await fetch(`${API_BASE}/wellness`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error('Failed to record wellness entry');
    return res.json();
  },

  // Assistant Chat
  async chat(message: string, history: any[] = []): Promise<{ reply: string; sources_consulted: string[]; disclaimer: string }> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error('Chat communication error');
    return res.json();
  },

  // NASA Datasets
  async uploadDataset(file: File): Promise<DatasetDetails> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/datasets/upload`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload and parse dataset');
    return res.json();
  },

  async listDatasets(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/datasets/list`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to list datasets');
    return res.json();
  },

  async getDataset(id: number): Promise<DatasetDetails> {
    const res = await fetch(`${API_BASE}/datasets/${id}`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to get dataset details');
    return res.json();
  },

  // Space weather
  async getSpaceWeather(): Promise<{ source: string; events: SpaceWeatherEvent[]; astronaut_dosimetry_disclaimer: string }> {
    const res = await fetch(`${API_BASE}/space-weather`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch space weather');
    return res.json();
  },

  // Medical officer
  async getAstronauts(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/medical/astronauts`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to load astronauts list');
    return res.json();
  },

  async getMedicalNotes(astronautId?: number): Promise<any[]> {
    const url = astronautId ? `${API_BASE}/medical/notes?astronaut_id=${astronautId}` : `${API_BASE}/medical/notes`;
    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to load notes');
    return res.json();
  },

  async addMedicalNote(data: { astronaut_id: number; title: string; content: string; recommendation?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/medical/notes`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save note');
    return res.json();
  }
};
