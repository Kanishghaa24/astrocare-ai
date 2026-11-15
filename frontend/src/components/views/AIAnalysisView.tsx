import React from 'react';
import { HealthAnalysis, HealthRecord } from '../../types';
import { 
  BrainCircuit, 
  HelpCircle,
  Scale
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AIAnalysisViewProps {
  analysis: HealthAnalysis | null;
  records: HealthRecord[];
}

export const AIAnalysisView: React.FC<AIAnalysisViewProps> = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="p-8 text-center aero-panel">
        <p className="text-xs text-slate-400 font-mono">Computing baseline deviation model...</p>
      </div>
    );
  }

  const metricNames: Record<string, { label: string; unit: string }> = {
    heart_rate: { label: 'Resting Heart Rate', unit: 'BPM' },
    blood_pressure_sys: { label: 'Systolic Blood Pressure', unit: 'mmHg' },
    blood_pressure_dia: { label: 'Diastolic Blood Pressure', unit: 'mmHg' },
    body_temperature: { label: 'Core Body Temperature', unit: '°C' },
    sleep_duration: { label: 'Sleep Duration', unit: 'hrs' },
    stress_level: { label: 'Cognitive Stress', unit: '/10' },
    physical_activity_minutes: { label: 'Exercise Duration', unit: 'mins' },
  };

  const baselineBarData = Object.entries(analysis.metrics)
    .filter(([_, data]) => data.available && data.latest !== undefined && data.baseline_mean !== undefined)
    .map(([key, data]) => ({
      name: metricNames[key]?.label || key,
      Current: data.latest,
      Baseline: data.baseline_mean
    }));

  return (
    <div className="space-y-4">
      {/* Title & Status Summary Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1c2738]">
        <div>
          <h1 className="text-base font-semibold text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-sky-400" />
            Statistical Baseline Deviation Analysis
          </h1>
          <p className="text-xs text-slate-400">
            Automated Z-score deviation comparison (\( \pm 2\sigma \)) against rolling astronaut personal baselines.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Status</span>
            <span className={`font-semibold ${
              analysis.overall_wellness.includes('Urgent') ? 'text-rose-400' :
              analysis.overall_wellness.includes('Attention') ? 'text-amber-400' :
              'text-emerald-400'
            }`}>
              {analysis.overall_wellness}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Completeness</span>
            <span className="font-semibold text-sky-400">{analysis.data_completeness_percent}%</span>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="aero-panel p-4">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1c2738]">
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-sky-400" /> Current Value vs. Personal Rolling Baseline
          </span>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span> Current
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Baseline Mean
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={baselineBarData} margin={{ top: 5, right: 5, left: -25, bottom: 20 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1c2738" vertical={false} />
              <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} interval={0} angle={-10} textAnchor="end" />
              <YAxis stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0b121e', borderColor: '#1c2738', fontSize: '11px', borderRadius: '2px' }}
              />
              <Bar dataKey="Current" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Baseline" fill="#6366f1" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Compact Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(analysis.metrics).map(([key, data]) => {
          const meta = metricNames[key] || { label: key, unit: '' };
          const isAnomaly = data.is_anomaly;

          return (
            <div 
              key={key} 
              className={`aero-panel p-3.5 border ${
                isAnomaly ? 'border-amber-700/60 bg-amber-950/10' : 'border-[#1c2738]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-200">{meta.label}</span>
                <span className={`text-[9px] font-mono px-1 py-0.2 uppercase border ${
                  data.status === 'urgent_review' ? 'border-rose-700 text-rose-300' :
                  data.status === 'needs_attention' ? 'border-amber-700 text-amber-300' :
                  data.available ? 'border-emerald-800 text-emerald-400' :
                  'border-slate-700 text-slate-500'
                }`}>
                  {data.status ? data.status.replace('_', ' ') : 'MISSING'}
                </span>
              </div>

              {data.available ? (
                <>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xl font-semibold telemetry-val text-white">
                      {data.latest} <span className="text-xs text-slate-400 font-sans">{meta.unit}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Mean: {data.baseline_mean} {meta.unit}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-[#1c2738] text-[10px] font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500 block">Z-SCORE</span>
                      <strong className={Math.abs(data.z_score || 0) >= 2.0 ? 'text-amber-400' : 'text-slate-300'}>
                        {data.z_score !== undefined ? `${data.z_score > 0 ? '+' : ''}${data.z_score}σ` : '--'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">TREND</span>
                      <strong className="text-sky-400 capitalize">{data.trend_direction}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">STD DEV</span>
                      <strong className="text-slate-300">±{data.baseline_std}</strong>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-3 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>No data in window</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Minimal Footer Disclaimer */}
      <div className="p-3 bg-[#0b121e] border border-[#1c2738] text-[11px] text-slate-400">
        <strong className="text-slate-300 font-mono uppercase">Operational Decision Support:</strong> Statistical anomalies represent deviations &gt;2 standard deviations (\( \pm 2\sigma \)) from personalized rolling baseline averages. Not a clinical diagnosis.
      </div>
    </div>
  );
};
