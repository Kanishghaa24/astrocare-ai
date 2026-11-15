import React, { useState, useEffect } from 'react';
import { api } from './api';
import { User, HealthRecord, Alert, MentalWellnessRecord, HealthAnalysis } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginSelectScreen } from './components/LoginSelectScreen';
import { AstronautLoginPage } from './components/AstronautLoginPage';
import { OfficerLoginPage } from './components/OfficerLoginPage';

// Views
import { OverviewView } from './components/views/OverviewView';
import { MonitoringView } from './components/views/MonitoringView';
import { HealthTrendsView } from './components/views/HealthTrendsView';
import { AIAnalysisView } from './components/views/AIAnalysisView';
import { AlertsView } from './components/views/AlertsView';
import { MentalWellnessView } from './components/views/MentalWellnessView';
import { AIAssistantView } from './components/views/AIAssistantView';
import { NASAResearchView } from './components/views/NASAResearchView';
import { SpaceEnvironmentView } from './components/views/SpaceEnvironmentView';
import { MedicalOfficerCenterView } from './components/views/MedicalOfficerCenterView';
import { MedicalReviewsView } from './components/views/MedicalReviewsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('overview');

  // URL Path router state
  const [path, setPath] = useState<string>(window.location.pathname || '/');

  // Shared Application Telemetry & Clinical Data
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [wellnessRecords, setWellnessRecords] = useState<MentalWellnessRecord[]>([]);
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [medicalNotes, setMedicalNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync browser URL bar
  const navigate = (newPath: string) => {
    window.history.pushState({}, '', newPath);
    setPath(newPath);
  };

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check existing session token on startup
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('astrocare_token');
      if (token) {
        try {
          const user = await api.getMe();
          setCurrentUser(user);
        } catch {
          api.logout();
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  // Fetch telemetry whenever currentUser changes
  const loadTelemetry = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [records, fetchedAlerts, fetchedWellness, fetchedAnalysis, fetchedNotes] = await Promise.all([
        api.getHealthRecords(),
        api.getAlerts(),
        api.getWellness(),
        api.getHealthAnalysis(),
        api.getMedicalNotes()
      ]);
      setHealthRecords(records);
      setAlerts(fetchedAlerts);
      setWellnessRecords(fetchedWellness);
      setAnalysis(fetchedAnalysis);
      setMedicalNotes(fetchedNotes);
    } catch (err) {
      console.error('Failed to load shared telemetry matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadTelemetry();
    }
  }, [currentUser]);

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    navigate('/');
  };

  const handleSimulate = async (days = 7, anomaly = false) => {
    await api.simulateReadings(days, anomaly);
    await loadTelemetry();
  };

  // Auth checkpoint
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#040810] flex items-center justify-center text-xs font-mono text-cyan-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-none border-2 border-cyan-500 border-t-transparent animate-spin" />
          <span className="tracking-widest uppercase text-[11px]">Connecting to AstroCare Gateway...</span>
        </div>
      </div>
    );
  }

  // ================= UN-AUTHENTICATED ROUTING =================
  // Strict requirement: FIRST SCREEN MUST BE LOGIN — NO LANDING PAGE!
  // At root `/`: Show Login selection interface with Astronaut Access & Medical Officer Access
  // At `/astronaut/login`: Dedicated Astronaut Login
  // At `/officer/login`: Dedicated Medical Officer Login
  if (!currentUser) {
    if (path === '/astronaut/login') {
      return (
        <AstronautLoginPage
          onSuccess={(user) => {
            setCurrentUser(user);
            setCurrentTab('overview');
            navigate('/dashboard');
          }}
          onNavigateHome={() => navigate('/')}
          onNavigateOfficer={() => navigate('/officer/login')}
        />
      );
    }

    if (path === '/officer/login') {
      return (
        <OfficerLoginPage
          onSuccess={(user) => {
            setCurrentUser(user);
            setCurrentTab('overview');
            navigate('/dashboard');
          }}
          onNavigateHome={() => navigate('/')}
          onNavigateAstronaut={() => navigate('/astronaut/login')}
        />
      );
    }

    // Root `/` or any other route when unauthenticated opens the Login Selection Screen
    return (
      <LoginSelectScreen
        onSelectAstronaut={() => navigate('/astronaut/login')}
        onSelectOfficer={() => navigate('/officer/login')}
      />
    );
  }

  // ================= AUTHENTICATED WORKSPACE =================
  const isOfficer = currentUser.role === 'medical_officer';
  const unresolvedCount = alerts.filter(a => !a.resolved).length;
  const latestMedicalNote = medicalNotes.length > 0 ? medicalNotes[0] : null;

  return (
    <div className="min-h-screen bg-[#040810] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => setCurrentTab(tab)}
        currentUser={currentUser}
        onLogout={handleLogout}
        unresolvedAlertCount={unresolvedCount}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#060c18]/60">
        <Header 
          currentUser={currentUser} 
          onRefreshData={loadTelemetry}
          isSimulating={loading}
        />

        <main className="flex-1 p-5 max-w-7xl w-full mx-auto space-y-4">
          {/* ASTRONAUT & COMMON VIEWS */}
          {currentTab === 'overview' && (
            <OverviewView
              records={healthRecords}
              alerts={alerts}
              analysis={analysis}
              onSimulate={handleSimulate}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              recentMedicalNote={latestMedicalNote}
            />
          )}

          {currentTab === 'monitoring' && (
            <MonitoringView
              records={healthRecords}
              onRefresh={loadTelemetry}
            />
          )}

          {currentTab === 'trends' && (
            <HealthTrendsView
              records={healthRecords}
              alerts={alerts}
            />
          )}

          {currentTab === 'ai-analysis' && (
            <AIAnalysisView
              analysis={analysis}
              records={healthRecords}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onRefresh={loadTelemetry}
            />
          )}

          {currentTab === 'mental-wellness' && (
            <MentalWellnessView
              records={wellnessRecords}
              onRefresh={loadTelemetry}
            />
          )}

          {currentTab === 'ai-assistant' && (
            <AIAssistantView
              userName={currentUser.name}
              astronautId={currentUser.astronaut_id}
            />
          )}

          {currentTab === 'space-env' && (
            <SpaceEnvironmentView />
          )}

          {currentTab === 'nasa-data' && (
            <NASAResearchView />
          )}

          {currentTab === 'medical-reviews' && (
            isOfficer ? (
              <MedicalOfficerCenterView
                initialSubTab="medical-reviews"
                onRefreshGlobal={loadTelemetry}
              />
            ) : (
              <MedicalReviewsView />
            )
          )}

          {/* MEDICAL OFFICER SPECIFIC VIEWS */}
          {currentTab === 'crew-monitoring' && isOfficer && (
            <MedicalOfficerCenterView
              initialSubTab="crew-monitoring"
              onRefreshGlobal={loadTelemetry}
            />
          )}

          {currentTab === 'astronaut-records' && isOfficer && (
            <MedicalOfficerCenterView
              initialSubTab="astronaut-records"
              onRefreshGlobal={loadTelemetry}
            />
          )}

          {currentTab === 'clinical-notes' && isOfficer && (
            <MedicalOfficerCenterView
              initialSubTab="medical-reviews"
              onRefreshGlobal={loadTelemetry}
            />
          )}

          {currentTab === 'research-analytics' && isOfficer && (
            <NASAResearchView />
          )}

          {currentTab === 'reports' && isOfficer && (
            <AnalyticsView
              records={healthRecords}
              alerts={alerts}
              userName={currentUser.name}
              astronautId={currentUser.astronaut_id}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              records={healthRecords}
              alerts={alerts}
              userName={currentUser.name}
              astronautId={currentUser.astronaut_id}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView currentUser={currentUser} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
