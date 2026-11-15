import React, { useState } from 'react';
import { HealthRecord, Alert, HealthAnalysis } from '../../types';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Moon, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  Play,
  Zap,
  CheckCircle2,
  FileText,
  Radio,
  Orbit,
  ArrowRight
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

interface OverviewViewProps {
  records: HealthRecord[];
  alerts: Alert[];
  analysis: HealthAnalysis | null;
  onSimulate: (days: number, anomaly: boolean) => Promise<void>;
  onNavigateTab: (tab: string) => void;
  recentMedicalNote?: any;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  records,
  alerts,
  analysis,
  onSimulate,
  onNavigateTab,
  recentMedicalNote
}) => {
  const [isSimulating, setIsSimulating] = useState(false);

  // Latest and previous
  const latest = records.length > 0 ? records[records.length - 1] : null;
  const previous = records.length > 1 ? records[records.length - 2] : null;

  // Chart data
  const chartData = records.slice(-14).map(r => ({
    date: new Date(r.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    heart_rate: r.heart_rate,
    systolic: r.blood_pressure_sys,
    sleep: r.sleep_duration
  }));

  const handleRunSimulation = async (anomaly: boolean) => {
    setIsSimulating(true);
    try {
      await onSimulate(7, anomaly);
    } finally {
      setIsSimulating(false);
    }
  };

  const getTrendIcon = (current?: number, prev?: number) => {
    if (current === undefined || prev === undefined) return <Minus className="w-3 h-3 text-slate-500" />;
    const diff = current - prev;
    if (Math.abs(diff) < 0.05 * (prev || 1)) return <Minus className="w-3 h-3 text-slate-400" />;
    if (diff > 0) return <TrendingUp className="w-3 h-3 text-cyan-400" />;
    return <TrendingDown className="w-3 h-3 text-indigo-400" />;
  };

  const activeAlerts = alerts.filter(a => !a.resolved);

  return (
    <div className="space-y-4">
      {/* Title & Aerospace Telemetry Sync Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#121f30]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <h1 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              Astronaut Telemetry Overview
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Real-time biometric streams and automated personal baseline tracking against NASA HRP thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunSimulation(false)}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#071324] hover:bg-[#0c1f38] border border-cyan-500/30 text-cyan-300 text-xs font-mono transition-all disabled:opacity-50 cursor-pointer shadow-sm hover:border-cyan-400"
          >
            <Play className="w-3 h-3 text-cyan-400" />
            <span>Generate Stream</span>
          </button>
          <button
            onClick={() => handleRunSimulation(true)}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a121f] hover:bg-amber-950/40 border border-amber-900/50 text-amber-300 text-xs font-mono transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Trigger Anomaly</span>
          </button>
        </div>
      </div>

      {/* Primary Health Indicators: Clean Aerospace Panels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Heart Rate */}
        <div className="bg-[#050c18] border border-[#14233a] p-3.5 relative overflow-hidden shadow-lg group hover:border-cyan-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-rose-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Heart className="w-3.5 h-3.5 text-rose-400" /> Heart Rate
            </span>
            <span className="text-[9px] font-mono px-1 py-0.5 bg-[#081526] border border-[#172c48] text-cyan-300">
              {latest?.data_source || 'SIMULATED'}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold telemetry-val text-white tracking-tight">
              {latest?.heart_rate ?? '--'}
            </span>
            <span className="text-xs text-slate-400 font-mono">BPM</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#121f30]">
            <span>Prev: <strong className="telemetry-val text-slate-300">{previous?.heart_rate ?? '--'}</strong></span>
            <div className="flex items-center gap-1">
              {getTrendIcon(latest?.heart_rate, previous?.heart_rate)}
              <span className="capitalize text-slate-300 font-mono text-[10px]">
                {analysis?.metrics?.heart_rate?.trend_direction || 'Stable'}
              </span>
            </div>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="bg-[#050c18] border border-[#14233a] p-3.5 relative overflow-hidden shadow-lg group hover:border-cyan-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-cyan-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> Blood Pressure
            </span>
            <span className="text-[9px] font-mono px-1 py-0.5 bg-[#081526] border border-[#172c48] text-cyan-300">
              {latest?.data_source || 'SIMULATED'}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold telemetry-val text-white tracking-tight">
              {latest?.blood_pressure_sys ? `${latest.blood_pressure_sys}/${latest.blood_pressure_dia}` : '--/--'}
            </span>
            <span className="text-xs text-slate-400 font-mono">mmHg</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#121f30]">
            <span>Target: &lt;135/85</span>
            <span className="text-emerald-400 font-mono text-[10px]">
              {latest?.blood_pressure_sys && latest.blood_pressure_sys < 135 ? 'Nominal' : 'Elevated'}
            </span>
          </div>
        </div>

        {/* Body Temperature */}
        <div className="bg-[#050c18] border border-[#14233a] p-3.5 relative overflow-hidden shadow-lg group hover:border-cyan-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Core Temp
            </span>
            <span className="text-[9px] font-mono px-1 py-0.5 bg-[#081526] border border-[#172c48] text-cyan-300">
              {latest?.data_source || 'SIMULATED'}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold telemetry-val text-white tracking-tight">
              {latest?.body_temperature ?? '--'}
            </span>
            <span className="text-xs text-slate-400 font-mono">°C</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#121f30]">
            <span>Ref: 36.5–37.5</span>
            <span className="text-emerald-400 font-mono text-[10px]">Normal</span>
          </div>
        </div>

        {/* Sleep Duration */}
        <div className="bg-[#050c18] border border-[#14233a] p-3.5 relative overflow-hidden shadow-lg group hover:border-cyan-500/40 transition-colors">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Moon className="w-3.5 h-3.5 text-indigo-400" /> Sleep Duration
            </span>
            <span className="text-[9px] font-mono px-1 py-0.5 bg-[#081526] border border-[#172c48] text-cyan-300">
              {latest?.data_source || 'SIMULATED'}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold telemetry-val text-white tracking-tight">
              {latest?.sleep_duration ?? '--'}
            </span>
            <span className="text-xs text-slate-400 font-mono">hrs</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#121f30]">
            <span>Goal: ≥7.0 hrs</span>
            <span className={`font-mono text-[10px] ${latest && (latest.sleep_duration || 0) < 6.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {latest && (latest.sleep_duration || 0) < 6.0 ? 'Deficit' : 'Optimal'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Telemetry Trends Chart + Compact Alerts List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cardiovascular Trend Chart */}
        <div className="lg:col-span-2 bg-[#050c18] border border-[#14233a] p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#121f30]">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                14-Day Cardiovascular Telemetry Matrix
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">Resting BPM & Systolic Trends in Microgravity</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> BPM
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span> Systolic
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#334155" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#334155" domain={[40, 160]} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050c18', borderColor: '#172a42', fontSize: '11px', borderRadius: '0px' }}
                />
                <Area type="monotone" dataKey="heart_rate" name="Heart Rate" stroke="#06b6d4" strokeWidth={1.8} fill="url(#hrGrad)" />
                <Area type="monotone" dataKey="systolic" name="Systolic BP" stroke="#818cf8" strokeWidth={1.5} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compact Alert Queue */}
        <div className="bg-[#050c18] border border-[#14233a] p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#121f30]">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Active Alerts ({activeAlerts.length})
              </h2>
              <button
                onClick={() => onNavigateTab('alerts')}
                className="text-[11px] text-cyan-400 hover:underline font-mono flex items-center gap-1"
              >
                <span>Center</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {activeAlerts.slice(0, 3).map(alert => (
                <div
                  key={alert.id}
                  className={`p-2.5 border text-xs ${
                    alert.severity === 'URGENT'
                      ? 'bg-rose-950/25 border-rose-900/60 text-rose-200'
                      : alert.severity === 'ATTENTION'
                      ? 'bg-amber-950/25 border-amber-900/60 text-amber-200'
                      : 'bg-[#040913] border-[#14233a] text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-medium mb-1">
                    <span className="truncate pr-2 font-semibold">{alert.title}</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 uppercase border border-current">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              ))}

              {activeAlerts.length === 0 && (
                <div className="py-10 text-center text-xs text-slate-500 flex flex-col items-center gap-1.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500/60" />
                  <span>Telemetry nominal. No active alerts.</span>
                </div>
              )}
            </div>
          </div>

          {/* Shared Clinical Review Notice */}
          {recentMedicalNote && (
            <div className="pt-3 border-t border-[#121f30] text-xs">
              <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] uppercase mb-1">
                <FileText className="w-3 h-3" /> Recent Flight Surgeon Directive:
              </div>
              <p className="text-[11px] text-slate-300 truncate font-mono">{recentMedicalNote.title}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
