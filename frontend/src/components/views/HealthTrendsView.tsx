import React, { useState } from 'react';
import { HealthRecord, Alert } from '../../types';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp,
  Activity,
  Heart,
  Moon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';

interface HealthTrendsViewProps {
  records: HealthRecord[];
  alerts: Alert[];
}

export const HealthTrendsView: React.FC<HealthTrendsViewProps> = ({
  records,
  alerts
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | 'all'>('14d');

  const sliceCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : records.length;
  const filteredRecords = records.slice(-sliceCount);

  const chartData = filteredRecords.map(r => ({
    date: new Date(r.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    heart_rate: r.heart_rate,
    systolic: r.blood_pressure_sys,
    diastolic: r.blood_pressure_dia,
    temperature: r.body_temperature,
    sleep: r.sleep_duration,
    activity: r.physical_activity_minutes,
    stress: r.stress_level
  }));

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1c2738]">
        <div>
          <h1 className="text-base font-semibold text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            Longitudinal Health Trends & Comparisons
          </h1>
          <p className="text-xs text-slate-400">
            Historical cardiovascular, thermal, and circadian trajectories over mission timelines.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 text-xs font-mono">
          <span className="text-slate-500 mr-2">WINDOW:</span>
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-2.5 py-1 ${timeRange === '7d' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('14d')}
            className={`px-2.5 py-1 ${timeRange === '14d' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            14 Days
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-2.5 py-1 ${timeRange === 'all' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            All ({records.length})
          </button>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cardiovascular Trend */}
        <div className="aero-panel p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400" /> Heart Rate & Blood Pressure Correlation
          </h2>
          <p className="text-[11px] text-slate-500 font-mono mb-3">Resting BPM vs Systolic/Diastolic Arterial Pressure</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1c2738" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#475569" domain={[40, 160]} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0b121e', borderColor: '#1c2738', fontSize: '11px', borderRadius: '2px' }} />
                <Line type="monotone" dataKey="heart_rate" name="Heart Rate (BPM)" stroke="#0ea5e9" strokeWidth={1.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="systolic" name="Systolic BP" stroke="#818cf8" strokeWidth={1.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="diastolic" name="Diastolic BP" stroke="#38bdf8" strokeWidth={1} strokeDasharray="3 3" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep & Exercise Countermeasures */}
        <div className="aero-panel p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1 flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-indigo-400" /> Circadian Sleep vs Countermeasure Exercise
          </h2>
          <p className="text-[11px] text-slate-500 font-mono mb-3">Rest recovery versus daily 60-min countermeasure target</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1c2738" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0b121e', borderColor: '#1c2738', fontSize: '11px', borderRadius: '2px' }} />
                <Bar dataKey="sleep" fill="#818cf8" name="Sleep Duration (hrs)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
