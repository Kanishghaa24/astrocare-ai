import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  BrainCircuit, 
  AlertTriangle, 
  Smile, 
  Bot, 
  Sun, 
  Database, 
  BarChart3, 
  Stethoscope, 
  Settings, 
  LogOut,
  Users,
  FileText,
  TrendingUp,
  FolderOpen
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  unresolvedAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onLogout,
  unresolvedAlertCount
}) => {
  const isOfficer = currentUser?.role === 'medical_officer';

  // Strict User Requirement:
  // Astronaut Sidebar:
  // - Overview
  // - Health Monitoring
  // - Health Trends
  // - AI Health Analysis
  // - Alerts
  // - Mental Wellness
  // - AstroCare Assistant
  // - Space Environment
  // - NASA Research Data
  // - Medical Reviews
  // - Settings
  const astronautNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'monitoring', label: 'Health Monitoring', icon: Activity },
    { id: 'trends', label: 'Health Trends', icon: TrendingUp },
    { id: 'ai-analysis', label: 'AI Health Analysis', icon: BrainCircuit },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: unresolvedAlertCount },
    { id: 'mental-wellness', label: 'Mental Wellness', icon: Smile },
    { id: 'ai-assistant', label: 'AstroCare Assistant', icon: Bot },
    { id: 'space-env', label: 'Space Environment', icon: Sun },
    { id: 'nasa-data', label: 'NASA Research Data', icon: Database },
    { id: 'medical-reviews', label: 'Medical Reviews', icon: Stethoscope },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Medical Officer Sidebar:
  // - Overview
  // - Crew Monitoring
  // - Astronaut Records
  // - Alerts
  // - Health Trends
  // - Medical Reviews
  // - Clinical Notes
  // - Research Analytics
  // - Reports
  // - Settings
  const officerNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'crew-monitoring', label: 'Crew Monitoring', icon: Users },
    { id: 'astronaut-records', label: 'Astronaut Records', icon: FolderOpen },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: unresolvedAlertCount },
    { id: 'trends', label: 'Health Trends', icon: TrendingUp },
    { id: 'medical-reviews', label: 'Medical Reviews', icon: Stethoscope },
    { id: 'clinical-notes', label: 'Clinical Notes', icon: FileText },
    { id: 'research-analytics', label: 'Research Analytics', icon: Database },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const visibleItems = isOfficer ? officerNav : astronautNav;

  return (
    <aside className="w-64 min-h-screen bg-[#040812] border-r border-[#121f30] flex flex-col justify-between shrink-0 select-none shadow-2xl">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-[#121f30] flex items-center justify-between bg-[#050b16]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-none bg-gradient-to-br from-cyan-500/20 to-sky-950 border border-cyan-500/50 flex items-center justify-center font-mono font-bold text-xs text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              AC
            </div>
            <div>
              <span className="text-xs font-bold tracking-[0.2em] text-white uppercase block leading-none">ASTROCARE AI</span>
              <span className="text-[9px] text-cyan-400 font-mono tracking-wider mt-1 block">
                {isOfficer ? 'MEDICAL SURGEON' : 'FLIGHT CREW'}
              </span>
            </div>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 border border-cyan-800/80 text-cyan-300 bg-cyan-950/50">
            {isOfficer ? 'TSMC' : 'LEO'}
          </span>
        </div>

        {/* User Identity Info */}
        {currentUser && (
          <div className="p-3.5 mx-3 mt-3 bg-[#060e1c] border border-[#14233a] shadow-inner">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-100 truncate">{currentUser.name}</p>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono text-slate-400">
              <span className="text-slate-300">{currentUser.astronaut_id}</span>
              <span className="text-cyan-400 font-medium">{isOfficer ? 'Flight Surgeon' : 'Astronaut'}</span>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="p-2.5 space-y-1 mt-2">
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs transition-all duration-150 rounded-none cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/80 to-[#081526] text-cyan-300 border-l-2 border-cyan-400 font-medium shadow-[inset_0_0_12px_rgba(6,182,212,0.1)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#071120] border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate tracking-wide">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 animate-pulse">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-[#121f30] bg-[#040810]">
        <div className="mb-2 text-[10px] font-mono text-slate-500 px-2 leading-tight">
          NASA HRP • Aerospace Telemetry
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-rose-400 hover:bg-[#0b1424] transition-colors cursor-pointer border border-transparent hover:border-rose-900/40"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px] uppercase tracking-wider">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
