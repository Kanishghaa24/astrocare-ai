import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Clock, Cpu, RefreshCw, Radio, Shield, Orbit } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  onRefreshData?: () => void;
  isSimulating?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onRefreshData, isSimulating }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const isOfficer = currentUser?.role === 'medical_officer';

  return (
    <header className="h-16 px-6 bg-[#040810]/90 backdrop-blur-md border-b border-[#132033] flex items-center justify-between sticky top-0 z-20 shadow-md">
      {/* Title & Mission Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
            {isOfficer ? 'Medical Directorate Supervision Console' : 'Crew Operational Health Telemetry'}
          </span>
        </div>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <div className="text-xs font-mono text-slate-400 hidden sm:flex items-center gap-2">
          <span>Mission:</span>
          <span className="text-cyan-300 font-medium px-1.5 py-0.5 bg-[#081324] border border-[#162740]">
            {currentUser?.mission_name || 'EXPEDITION-72'}
          </span>
          <span className="text-slate-500 font-mono">(MD-{currentUser?.mission_day || 42})</span>
        </div>
      </div>

      {/* Telemetry Status & Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#060e1c] border border-[#14233a] text-[11px] font-mono text-slate-400 shadow-inner">
          <Orbit className="w-3.5 h-3.5 text-cyan-400" />
          <span>LEO Altitude: <strong className="text-cyan-300">408.2 km</strong></span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#060e1c] border border-[#14233a] text-[11px] font-mono text-slate-400 shadow-inner">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Stream: <strong className="text-emerald-400">ONLINE</strong></span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#060e1c] border border-[#14233a] text-[11px] font-mono text-slate-300 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{time || 'UTC Sync'}</span>
        </div>

        {onRefreshData && (
          <button
            onClick={onRefreshData}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#081324] hover:bg-[#0e203c] border border-[#162740] hover:border-cyan-500/50 text-slate-200 text-xs font-mono transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            title="Synchronize Telemetry Matrix"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span className="uppercase text-[11px] tracking-wider">Sync Matrix</span>
          </button>
        )}
      </div>
    </header>
  );
};
