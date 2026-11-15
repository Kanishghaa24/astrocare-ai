import React, { useState, useEffect } from 'react';
import { SpaceWeatherEvent } from '../../types';
import { api } from '../../api';
import { 
  Sun, 
  ShieldAlert, 
  Zap, 
  Globe
} from 'lucide-react';

export const SpaceEnvironmentView: React.FC = () => {
  const [data, setData] = useState<{ source: string; events: SpaceWeatherEvent[]; astronaut_dosimetry_disclaimer: string } | null>(null);

  useEffect(() => {
    const fetchEnv = async () => {
      try {
        const res = await api.getSpaceWeather();
        setData(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEnv();
  }, []);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="pb-3 border-b border-[#1c2738]">
        <h1 className="text-base font-semibold text-slate-100 uppercase tracking-wide flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-400" />
          Space Environment & Solar Weather (NASA DONKI)
        </h1>
        <p className="text-xs text-slate-400">
          Real-time Solar Energetic Particle (SEP) events, Coronal Mass Ejections, and orbital flux.
        </p>
      </div>

      {/* Protocol Banner */}
      <div className="p-3 bg-[#0b121e] border border-amber-900/60 text-xs text-slate-300 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="text-amber-300 font-mono text-[11px] uppercase">Dosimetry Notice:</strong>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {data?.astronaut_dosimetry_disclaimer || 
              "Space environment events represent ambient solar activity. They are not direct astronaut biological dosages without calibrated passive/active biodosimeter models."
            }
          </p>
        </div>
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {data?.events.map(event => {
          const isElevated = event.radiation_risk_level === 'ELEVATED';

          return (
            <div
              key={event.event_id}
              className={`aero-panel p-3.5 border ${
                isElevated ? 'border-amber-700/60 bg-amber-950/10' : 'border-[#1c2738]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-500">{event.event_id}</span>
                <span className={`text-[9px] font-mono px-1 py-0.2 uppercase border ${
                  isElevated ? 'border-amber-600 text-amber-300' : 'border-sky-600 text-sky-300'
                }`}>
                  Risk: {event.radiation_risk_level}
                </span>
              </div>

              <h2 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {event.event_type}
              </h2>

              <div className="space-y-1 text-[11px] font-mono text-slate-400 my-2 pt-2 border-t border-[#1c2738]">
                <div className="flex justify-between">
                  <span>Source:</span>
                  <span className="text-slate-200">{event.source_location}</span>
                </div>
                {event.speed_km_s && (
                  <div className="flex justify-between">
                    <span>Speed:</span>
                    <span className="text-sky-400">{event.speed_km_s} km/s</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="text-slate-300">
                    {new Date(event.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="p-2 bg-[#070c14] border border-[#1c2738] text-[10px] text-slate-300">
                <strong className="text-slate-400">Advisory:</strong> {event.impact_warning}
              </div>
            </div>
          );
        })}
      </div>

      <div className="aero-panel p-3.5 text-xs text-slate-400 flex items-center gap-2">
        <Globe className="w-4 h-4 text-sky-400 shrink-0" />
        <span>Connected to NASA GSFC Community Coordinated Modeling Center (DONKI) active solar catalog.</span>
      </div>
    </div>
  );
};
