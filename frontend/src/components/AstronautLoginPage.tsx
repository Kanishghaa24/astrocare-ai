import React, { useState } from 'react';
import { api } from '../api';
import { User } from '../types';
import { Compass, AlertCircle, ArrowRight, ArrowLeft, Shield, Orbit, HeartPulse, UserCheck } from 'lucide-react';
import { AerospaceGlobe } from './AerospaceGlobe';

interface AstronautLoginPageProps {
  onSuccess: (user: User) => void;
  onNavigateHome: () => void;
  onNavigateOfficer: () => void;
}

export const AstronautLoginPage: React.FC<AstronautLoginPageProps> = ({
  onSuccess,
  onNavigateHome,
  onNavigateOfficer
}) => {
  const [email, setEmail] = useState('astronaut@nasa.gov');
  const [password, setPassword] = useState('Astro2026!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(email, password);
      if (res.user.role !== 'astronaut') {
        setError('Access Denied: This credential is for a Medical Officer. Switch to Medical Officer Access.');
        api.logout();
        return;
      }
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication rejected. Verify flight credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#040810] text-slate-100 flex flex-col justify-between overflow-hidden selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Top Atmospheric Ambient Gradients */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_70%_at_50%_-10%,rgba(14,165,233,0.12),transparent)]" />

      {/* Top Flight Navigation Header */}
      <header className="relative z-20 h-16 px-6 lg:px-12 flex items-center justify-between border-b border-[#132033] bg-[#040810]/75 backdrop-blur-md">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors py-1 px-2 border border-transparent hover:border-[#1e324d] hover:bg-[#071120]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>PORTAL SELECTION</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-none bg-gradient-to-br from-cyan-500/20 to-sky-950 border border-cyan-500/50 flex items-center justify-center font-mono font-bold text-xs text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            AC
          </div>
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-white uppercase block">ASTROCARE AI</span>
            <span className="text-[9px] text-cyan-400 font-mono tracking-widest block">FLIGHT CREW DIVISION</span>
          </div>
        </div>

        <button
          onClick={onNavigateOfficer}
          className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors hidden sm:flex items-center gap-1.5"
        >
          <span>Switch to Medical Officer</span>
          <ArrowRight className="w-3 h-3 text-cyan-400" />
        </button>
      </header>

      {/* Split-Screen 3D Display & Dedicated Astronaut Login Form */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-8rem)]">
        
        {/* LEFT SIDE: 3D Globe + Aerospace Crew HUD Visual */}
        <section className="relative lg:col-span-7 flex flex-col justify-between p-6 lg:p-12 overflow-hidden border-b lg:border-b-0 lg:border-r border-[#132033]/80">
          <div className="absolute inset-0 z-0">
            <AerospaceGlobe />
          </div>

          {/* Top Flight Badge */}
          <div className="relative z-10 pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#060e1a]/80 backdrop-blur-md border border-cyan-500/30 text-[11px] font-mono text-cyan-400">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>CREW TELEMETRY PORTAL • EXPEDITION FLIGHT LOG</span>
            </div>

            <div className="mt-4 max-w-lg">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-snug">
                Astronaut Health & Autonomous Physiological Diagnostics
              </h1>
              <p className="text-xs text-slate-300 font-mono mt-2 leading-relaxed backdrop-blur-xs">
                Log biometric telemetry, analyze personal cardiovascular baselines, monitor circadian variability, and access AI-assisted flight medical protocols.
              </p>
            </div>
          </div>

          {/* Bottom Live Flight Indicators */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 pointer-events-none mt-16 sm:mt-0 max-w-xl">
            <div className="bg-[#050c18]/85 backdrop-blur-md border border-[#172a42] p-3 shadow-lg">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>CREW ID</span>
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-sm font-mono font-bold text-cyan-300 mt-1">ASTRO-01</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Cmdr. Alex Vance</div>
            </div>

            <div className="bg-[#050c18]/85 backdrop-blur-md border border-[#172a42] p-3 shadow-lg">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>HEART RATE BASELINE</span>
                <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-sm font-mono font-bold text-emerald-300 mt-1">68 <span className="text-xs font-normal text-slate-400">BPM</span></div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Optimal Range</div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-[#050c18]/85 backdrop-blur-md border border-[#172a42] p-3 shadow-lg">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>ORBIT STATUS</span>
                <Orbit className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-sm font-mono font-bold text-slate-100 mt-1">REV 14,892</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Apogee 418 km</div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE: Astronaut Access Authentication Form */}
        <section className="relative lg:col-span-5 flex flex-col justify-center items-center p-6 lg:p-12 bg-gradient-to-b from-[#070e1c]/90 via-[#050a14]/95 to-[#040810] backdrop-blur-xl">
          <div className="w-full max-w-sm space-y-6">
            
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 tracking-wider uppercase mb-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Flight Personnel Credential</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Astronaut Access</h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Provide your authorized mission credentials to access flight telemetry records and medical diagnostic tools.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/30 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Astronaut Identifier / Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#050b14] border border-[#16273e] text-white focus:outline-none focus:border-cyan-400 font-mono text-xs shadow-inner"
                    placeholder="astronaut@nasa.gov"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Authorization Keycode
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">AES-256</span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#050b14] border border-[#16273e] text-white focus:outline-none focus:border-cyan-400 font-mono text-xs shadow-inner"
                  placeholder="••••••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-mono text-xs font-semibold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 cursor-pointer border border-cyan-400/30 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating Telemetry Key...' : 'Sign In'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="pt-4 border-t border-[#132033] flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Flight Surgeon / Physician?</span>
              <button
                type="button"
                onClick={onNavigateOfficer}
                className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition-colors"
              >
                <span>Medical Officer Access</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        </section>
      </main>

      {/* Footer bar */}
      <footer className="relative z-20 h-10 px-6 lg:px-12 border-t border-[#132033] bg-[#040810]/80 backdrop-blur-md flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div>ORBITAL TELEMETRY PORTAL • CREW OPERATIONS</div>
        <div>STATION TIME UTC {new Date().toISOString().slice(11, 19)}</div>
      </footer>
    </div>
  );
};
