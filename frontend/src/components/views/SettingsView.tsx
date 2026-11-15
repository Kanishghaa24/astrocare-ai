import React from 'react';
import { 
  ShieldCheck, 
  Settings as SettingsIcon, 
  Cpu, 
  Database
} from 'lucide-react';
import { User } from '../../types';

interface SettingsViewProps {
  currentUser?: User | null;
}

export const SettingsView: React.FC<SettingsViewProps> = () => {
  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-[#1c2738]">
        <h1 className="text-base font-semibold text-slate-100 uppercase tracking-wide flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-sky-400" />
          Mission Architecture & Protocol Governance
        </h1>
        <p className="text-xs text-slate-400">
          AstroCare AI system parameters, flight surgeon directives, and Space Apps Challenge 2026 specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ethical Standards */}
        <div className="aero-panel p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" /> Medical Ethics & Non-Diagnostic Compliance
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            AstroCare AI operates strictly as an <strong>operational decision support system</strong>, not a clinical diagnostic apparatus.
          </p>

          <ul className="space-y-2 text-xs text-slate-400 font-mono text-[11px]">
            <li className="flex items-start gap-2">
              <span className="text-sky-400">•</span>
              <span><strong>Statistical Anomaly Bounds:</strong> Baseline alerts trigger at \( \pm 2\sigma \) Z-score variations.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-400">•</span>
              <span><strong>Explicit Provenance:</strong> Simulated telemetry, manual check-ins, and NASA OSDR research are labeled independently.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-400">•</span>
              <span><strong>Escalation Directive:</strong> Urgent alerts direct astronauts to consult the Flight Surgeon immediately.</span>
            </li>
          </ul>
        </div>

        {/* Stack Architecture */}
        <div className="aero-panel p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" /> Technical Architecture
          </h2>
          <div className="space-y-2 text-xs font-mono text-[11px] text-slate-300">
            <div className="flex justify-between border-b border-[#1c2738] pb-1.5">
              <span className="text-slate-500">Frontend Stack:</span>
              <span className="text-sky-400">React 18 • TypeScript • Tailwind</span>
            </div>
            <div className="flex justify-between border-b border-[#1c2738] pb-1.5">
              <span className="text-slate-500">Visualization:</span>
              <span className="text-slate-300">Recharts Compact Engineering Graphs</span>
            </div>
            <div className="flex justify-between border-b border-[#1c2738] pb-1.5">
              <span className="text-slate-500">Backend API:</span>
              <span className="text-emerald-400">FastAPI • Python 3.14 REST API</span>
            </div>
            <div className="flex justify-between border-b border-[#1c2738] pb-1.5">
              <span className="text-slate-500">Analytics Engine:</span>
              <span className="text-slate-300">Pandas • NumPy (Z-Score Engine)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Database Layer:</span>
              <span className="text-amber-400">SQLite • SQLAlchemy ORM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Attribution */}
      <div className="aero-panel p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1 flex items-center gap-2">
          <Database className="w-4 h-4 text-sky-400" /> NASA Open Science Data Repository (OSD-575)
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Integrated with the NASA OSDR Inspiration4 single-cell RNA-seq and cytokine profiling study. Dynamically detects data types and handles missingness without fabricating data streams.
        </p>
      </div>
    </div>
  );
};
