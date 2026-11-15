import React, { useState } from 'react';
import { HealthRecord, Alert } from '../../types';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet
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

interface AnalyticsViewProps {
  records: HealthRecord[];
  alerts: Alert[];
  userName?: string;
  astronautId?: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  records,
  alerts,
  astronautId
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | 'all'>('14d');

  const sliceCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : records.length;
  const filteredRecords = records.slice(-sliceCount);

  const chartData = filteredRecords.map(r => ({
    date: new Date(r.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    heart_rate: r.heart_rate,
    systolic: r.blood_pressure_sys,
    temperature: r.body_temperature,
    sleep: r.sleep_duration
  }));

  const alertCountsByCategory = alerts.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const alertChartData = Object.entries(alertCountsByCategory).map(([cat, count]) => ({
    category: cat,
    count
  }));

  const handleExportCSV = () => {
    const headers = ["Timestamp", "Heart_Rate_BPM", "BP_Systolic", "BP_Diastolic", "Temp_C", "Sleep_Hours", "Activity_Mins", "Stress_1_10", "Data_Provenance", "Notes"];
    const rows = records.map(r => [
      r.timestamp,
      r.heart_rate ?? "",
      r.blood_pressure_sys ?? "",
      r.blood_pressure_dia ?? "",
      r.body_temperature ?? "",
      r.sleep_duration ?? "",
      r.physical_activity_minutes ?? "",
      r.stress_level ?? "",
      r.data_source,
      `"${(r.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + ["# AstroCare AI Astronaut Telemetry Export (NASA HRP Decision Support)", headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AstroCare_${astronautId || 'ASTRO'}_Telemetry_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1c2738]">
        <div>
          <h1 className="text-base font-semibold text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            Longitudinal Health Analytics & Reports
          </h1>
          <p className="text-xs text-slate-400">
            Export verified mission telemetry logs and printable medical dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b121e] hover:bg-slate-800 text-slate-200 text-xs font-mono border border-[#1c2738] transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="aero-panel p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-2">
            Resting Heart Rate & Body Temperature
          </h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1c2738" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis yAxisId="left" stroke="#0ea5e9" domain={[50, 120]} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" domain={[35.5, 38.5]} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0b121e', borderColor: '#1c2738', fontSize: '11px', borderRadius: '2px' }} />
                <Line yAxisId="left" type="monotone" dataKey="heart_rate" name="Heart Rate (BPM)" stroke="#0ea5e9" strokeWidth={1.5} dot={{ r: 2 }} />
                <Line yAxisId="right" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="aero-panel p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-2">
            Alert Incidence by Subsystem
          </h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1c2738" vertical={false} />
                <XAxis dataKey="category" stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0b121e', borderColor: '#1c2738', fontSize: '11px', borderRadius: '2px' }} />
                <Bar dataKey="count" fill="#ec4899" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
