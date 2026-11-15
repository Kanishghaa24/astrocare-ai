import React from 'react';
import { Compass, Stethoscope, ArrowRight, Activity, ShieldCheck, Database, Radio } from 'lucide-react';

interface LandingPageProps {
  onNavigateAstronaut: () => void;
  onNavigateOfficer: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateAstronaut,
  onNavigateOfficer
}) => {
  return (
    <div className="min-h-screen bg-[#070c14] text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="h-16 px-6 max-w-6xl mx-auto w-full flex items-center justify-between border-b border-[#1c2738]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-sky-400">
            AC
          </div>
          <div className="leading-none">
            <span className="text-sm font-semibold tracking-wider text-slate-100 uppercase">AstroCare AI</span>
            <span className="text-[10px] text-slate-500 font-mono ml-2 block sm:inline">NASA SPACE APPS 2026</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateAstronaut}
            className="px-3 py-1.5 bg-[#0b121e] hover:bg-slate-800 border border-[#1c2738] text-slate-300 text-xs font-mono transition-colors"
          >
            Astronaut Access
          </button>
          <button
            onClick={onNavigateOfficer}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono transition-colors"
          >
            Medical Officer
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#0b121e] border border-[#1c2738] text-xs font-mono text-sky-400">
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span>OPERATIONAL FLIGHT HEALTH MONITORING & DECISION SUPPORT</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-tight max-w-2xl">
            Astronaut Health Monitoring & Clinical Decision Support for Long-Duration Spaceflight
          </h1>

          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Engineered for orbital stations and deep space missions to track physical vitals, identify physiological deviations against personal baselines, evaluate early warning alerts, and support flight surgeon consultation.
          </p>

          {/* Access CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 max-w-xl">
            <button
              onClick={onNavigateAstronaut}
              className="p-5 bg-[#0b121e] hover:bg-[#101a2b] border border-[#1c2738] hover:border-sky-500/60 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-sky-400 mb-2">
                  <Compass className="w-5 h-5" />
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-1">
                  Astronaut Access
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Log daily biometrics, view personal trend analyses, and review early warning alerts.
                </p>
              </div>
              <span className="text-[11px] font-mono text-sky-400 mt-4 block">
                Open Crew Portal &rarr;
              </span>
            </button>

            <button
              onClick={onNavigateOfficer}
              className="p-5 bg-[#0b121e] hover:bg-[#101a2b] border border-[#1c2738] hover:border-sky-500/60 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-sky-400 mb-2">
                  <Stethoscope className="w-5 h-5" />
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-1">
                  Medical Officer Access
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Monitor active crew manifests, author clinical reviews, and inspect NASA OSDR research datasets.
                </p>
              </div>
              <span className="text-[11px] font-mono text-sky-400 mt-4 block">
                Open Medical Directorate &rarr;
              </span>
            </button>
          </div>

          {/* Core Feature Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-[#1c2738]">
            <div className="p-3 bg-[#0b121e] border border-[#1c2738]">
              <span className="text-[10px] font-mono uppercase text-sky-400 block mb-1">01. Biometrics</span>
              <h3 className="text-xs font-semibold text-white">Vital Telemetry & Anomaly Detection</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Resting cardiovascular, temperature, and sleep analytics with personal \(Z\)-score tracking.
              </p>
            </div>
            <div className="p-3 bg-[#0b121e] border border-[#1c2738]">
              <span className="text-[10px] font-mono uppercase text-sky-400 block mb-1">02. Decision Support</span>
              <h3 className="text-xs font-semibold text-white">Early Warning Alert Engine</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Rule-based threshold alerts connected directly to approved flight surgeon response protocols.
              </p>
            </div>
            <div className="p-3 bg-[#0b121e] border border-[#1c2738]">
              <span className="text-[10px] font-mono uppercase text-sky-400 block mb-1">03. OSDR Research</span>
              <h3 className="text-xs font-semibold text-white">NASA Inspiration4 (OSD-575)</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Dynamic ingestion and column schema analysis for open-science spaceflight biological datasets.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 px-6 max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between border-t border-[#1c2738] text-[11px] text-slate-500 font-mono">
        <div>AstroCare AI • Strictly Non-Diagnostic Operational Healthcare Software</div>
        <div>NASA Space Apps Challenge 2026</div>
      </footer>
    </div>
  );
};
