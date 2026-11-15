import React, { useState } from 'react';
import { Compass, Stethoscope, ArrowRight, ShieldCheck, Activity, Radio, Cpu, Layers } from 'lucide-react';
import { AerospaceGlobe } from './AerospaceGlobe';

interface LoginSelectScreenProps {
  onSelectAstronaut: () => void;
  onSelectOfficer: () => void;
}

export const LoginSelectScreen: React.FC<LoginSelectScreenProps> = ({
  onSelectAstronaut,
  onSelectOfficer
}) => {
  const [selectedRole, setSelectedRole] = useState<'astronaut' | 'officer'>('astronaut');

  return (
    <div className="relative min-h-screen w-full bg-[#040810] text-slate-100 flex flex-col justify-between overflow-hidden selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Background Subtle Radar Grid and Ambient Radial Glows */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.08),transparent_50%)]" />

      {/* Top Aerospace Header */}
      <header className="relative z-20 h-16 px-6 lg:px-12 flex items-center justify-between border-b border-[#132033] bg-[#040810]/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-gradient-to-br from-cyan-500/20 to-sky-950 border border-cyan-500/50 flex items-center justify-center font-mono font-bold text-xs text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            AC
          </div>
          <div className="leading-none">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-[0.22em] text-white uppercase">ASTROCARE AI</span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono tracking-wider text-cyan-300 bg-cyan-950/60 border border-cyan-800/80">
                ORBITAL 3D
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-1 block">
              NASA HUMAN RESEARCH DECISION PLATFORM
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[11px] font-mono text-slate-400">
          <div className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-slate-300">TELEMETRY LINK SYNCHRONIZED</span>
          </div>
          <div className="hidden sm:block text-slate-500 border-l border-[#132033] pl-6">
            UTC {new Date().toISOString().slice(11, 19)}
          </div>
        </div>
      </header>

      {/* Main Split-Screen Section */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-8rem)]">
        
        {/* LEFT SIDE: 3D Visualization, Orbital Trajectory & Telemetry HUD (7 cols on desktop) */}
        <section className="relative lg:col-span-7 flex flex-col justify-between p-6 lg:p-12 overflow-hidden border-b lg:border-b-0 lg:border-r border-[#132033]/80">
          {/* Real-time WebGL 3D Globe Canvas */}
          <div className="absolute inset-0 z-0">
            <AerospaceGlobe />
          </div>

          {/* Foreground Top Telemetry Overlay */}
          <div className="relative z-10 pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#060e1a]/80 backdrop-blur-md border border-cyan-500/30 text-[11px] font-mono text-cyan-400">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>ORBITAL STATION GEO-TRACKING • 408 KM ALTITUDE</span>
            </div>

            <div className="mt-4 max-w-lg">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-snug drop-shadow-md">
                Continuous Physiological Telemetry & Clinical Decision Intelligence
              </h1>
              <p className="text-xs text-slate-300/90 mt-2 font-mono leading-relaxed backdrop-blur-xs">
                Deep space health surveillance engineered for long-duration spaceflight. Analyzing cardiovascular dynamics, circadian rhythms, microgravity adaptation, and cosmic radiation exposure.
              </p>
            </div>
          </div>

          {/* Floating Telemetry Glass Badges */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 pointer-events-none mt-16 sm:mt-0 max-w-xl">
            <div className="bg-[#050c18]/85 backdrop-blur-md border border-[#172a42] p-3 shadow-lg">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>ORBIT VELOCITY</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>
              <div className="text-lg font-mono font-bold text-cyan-300 mt-1">7.66 <span className="text-xs font-normal text-slate-400">km/s</span></div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">LEO Trajectory Active</div>
            </div>

            <div className="bg-[#050c18]/85 backdrop-blur-md border border-[#172a42] p-3 shadow-lg">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>HABITAT CABIN</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <div className="text-lg font-mono font-bold text-emerald-300 mt-1">101.3 <span className="text-xs font-normal text-slate-400">kPa</span></div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">O2: 21.0% | CO2: 0.28%</div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-[#050c18]/85 backdrop-blur-md border border-[#172a42] p-3 shadow-lg">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>SYSTEM MODE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>
              <div className="text-lg font-mono font-bold text-slate-100 mt-1">NOMINAL</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">AI Engine Armed</div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE: Authentication Gateway Selector (5 cols on desktop) */}
        <section className="relative lg:col-span-5 flex flex-col justify-center items-center p-6 lg:p-12 bg-gradient-to-b from-[#070e1c]/90 via-[#050a14]/95 to-[#040810] backdrop-blur-xl">
          <div className="w-full max-w-md space-y-6">
            
            {/* Mission Authentication Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 tracking-wider uppercase mb-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Secure Access Gateway</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Mission Authorization</h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Select your designated role to enter the secure flight monitoring environment.
              </p>
            </div>

            {/* Role Cards Selection */}
            <div className="space-y-3.5">
              
              {/* Option 1: Astronaut Access */}
              <div 
                onClick={() => setSelectedRole('astronaut')}
                className={`p-5 cursor-pointer transition-all border relative ${
                  selectedRole === 'astronaut'
                    ? 'bg-[#0a1526] border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.18)] ring-1 ring-cyan-500/30'
                    : 'bg-[#060c17] border-[#142136] hover:border-slate-600 hover:bg-[#08101e]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 flex items-center justify-center border ${
                      selectedRole === 'astronaut' 
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300' 
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}>
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-wide uppercase">Astronaut Access</h3>
                      <span className="text-[11px] font-mono text-cyan-400">Flight Crew Workspace</span>
                    </div>
                  </div>
                  <input 
                    type="radio" 
                    name="role" 
                    checked={selectedRole === 'astronaut'} 
                    onChange={() => setSelectedRole('astronaut')}
                    className="accent-cyan-500 mt-1" 
                  />
                </div>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Log biometric telemetry, review personalized physiological baselines, monitor early warning anomaly markers, and interact with the AI assistant.
                </p>
                <div className="mt-3.5 pt-2.5 border-t border-[#142136] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Routing: <span className="text-slate-300">/astronaut/login</span></span>
                  <span className="text-cyan-400 flex items-center gap-1">Crew Profile &rarr;</span>
                </div>
              </div>

              {/* Option 2: Medical Officer Access */}
              <div 
                onClick={() => setSelectedRole('officer')}
                className={`p-5 cursor-pointer transition-all border relative ${
                  selectedRole === 'officer'
                    ? 'bg-[#0a1526] border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.18)] ring-1 ring-cyan-500/30'
                    : 'bg-[#060c17] border-[#142136] hover:border-slate-600 hover:bg-[#08101e]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 flex items-center justify-center border ${
                      selectedRole === 'officer' 
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300' 
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}>
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-wide uppercase">Medical Officer Access</h3>
                      <span className="text-[11px] font-mono text-cyan-400">Flight Surgeon Operations</span>
                    </div>
                  </div>
                  <input 
                    type="radio" 
                    name="role" 
                    checked={selectedRole === 'officer'} 
                    onChange={() => setSelectedRole('officer')}
                    className="accent-cyan-500 mt-1" 
                  />
                </div>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Supervise multi-crew physiological data, resolve clinical alarms, author and synchronize medical reviews, and inspect NASA OSDR research datasets.
                </p>
                <div className="mt-3.5 pt-2.5 border-t border-[#142136] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Routing: <span className="text-slate-300">/officer/login</span></span>
                  <span className="text-cyan-400 flex items-center gap-1">Surgeon Console &rarr;</span>
                </div>
              </div>

            </div>

            {/* Launch Login Flow Action Button */}
            <button
              onClick={() => {
                if (selectedRole === 'astronaut') {
                  onSelectAstronaut();
                } else {
                  onSelectOfficer();
                }
              }}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-mono text-xs font-semibold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 cursor-pointer border border-cyan-400/30"
            >
              <span>Proceed to {selectedRole === 'astronaut' ? 'Astronaut' : 'Medical Officer'} Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Footer Notice */}
            <div className="pt-2 text-center text-[10px] font-mono text-slate-500">
              Direct Route Access: Use <span className="text-slate-400">/astronaut/login</span> or <span className="text-slate-400">/officer/login</span>
            </div>

          </div>
        </section>
      </main>

      {/* Footer bar */}
      <footer className="relative z-20 h-10 px-6 lg:px-12 border-t border-[#132033] bg-[#040810]/80 backdrop-blur-md flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div>ASTROCARE-AI SECURE GATEWAY • REVISION 2026.4</div>
        <div className="hidden sm:block">RESTRICTED USE • NASA HUMAN RESEARCH PROGRAM PROTOCOLS</div>
      </footer>
    </div>
  );
};
