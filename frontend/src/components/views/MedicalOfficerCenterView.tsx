import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { HealthRecord, Alert } from '../../types';
import { 
  Stethoscope, 
  Users, 
  FileText, 
  Plus,
  AlertTriangle,
  FolderOpen,
  Search,
  CheckCircle2,
  Clock,
  Download,
  Calendar
} from 'lucide-react';

interface MedicalOfficerCenterViewProps {
  initialSubTab?: string;
  onRefreshGlobal?: () => void;
}

export const MedicalOfficerCenterView: React.FC<MedicalOfficerCenterViewProps> = ({ 
  initialSubTab = 'crew-monitoring',
  onRefreshGlobal 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(initialSubTab);
  const [astronauts, setAstronauts] = useState<any[]>([]);
  const [selectedAstro, setSelectedAstro] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stored Shared Records
  const [selectedRecords, setSelectedRecords] = useState<HealthRecord[]>([]);
  const [selectedAlerts, setSelectedAlerts] = useState<Alert[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  
  // Note Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  const loadAstronauts = async () => {
    try {
      const data = await api.getAstronauts();
      setAstronauts(data);
      if (data.length > 0 && !selectedAstro) {
        selectAstronaut(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectAstronaut = async (astro: any) => {
    setSelectedAstro(astro);
    try {
      const [fetchedRecords, fetchedAlerts, fetchedNotes] = await Promise.all([
        api.getHealthRecords(astro.id),
        api.getAlerts(astro.id),
        api.getMedicalNotes(astro.id)
      ]);
      setSelectedRecords(fetchedRecords);
      setSelectedAlerts(fetchedAlerts);
      setNotes(fetchedNotes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAstronauts();
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAstro || !title.trim() || !content.trim()) return;

    setSubmittingNote(true);
    try {
      await api.addMedicalNote({
        astronaut_id: selectedAstro.id,
        title,
        content,
        recommendation: recommendation || undefined
      });
      setTitle('');
      setContent('');
      setRecommendation('');
      const updatedNotes = await api.getMedicalNotes(selectedAstro.id);
      setNotes(updatedNotes);
      if (onRefreshGlobal) onRefreshGlobal();
      alert(`Medical review logged. This note is now immediately visible in Astronaut ${selectedAstro.name}'s account.`);
    } catch (err: any) {
      alert(`Error saving medical review: ${err.message}`);
    } finally {
      setSubmittingNote(false);
    }
  };

  const filteredAstronauts = astronauts.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.astronaut_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Title Bar with Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1c2738]">
        <div>
          <h1 className="text-base font-semibold text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-sky-400" />
            Flight Medical Officer Operations Directorate
          </h1>
          <p className="text-xs text-slate-400">
            Multi-crew telemetry surveillance, authorized medical reviews, and protocol directives.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-[#0b121e] border border-[#1c2738] p-1 text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('crew-monitoring')}
            className={`px-2.5 py-1 transition-colors ${activeSubTab === 'crew-monitoring' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-400'}`}
          >
            Crew Monitoring
          </button>
          <button
            onClick={() => setActiveSubTab('astronaut-records')}
            className={`px-2.5 py-1 transition-colors ${activeSubTab === 'astronaut-records' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-400'}`}
          >
            Astronaut Records
          </button>
          <button
            onClick={() => setActiveSubTab('medical-reviews')}
            className={`px-2.5 py-1 transition-colors ${activeSubTab === 'medical-reviews' ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-400'}`}
          >
            Medical Reviews & Notes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Crew Roster Sidebar with Search */}
        <div className="aero-panel p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-slate-300 uppercase font-mono flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" /> Crew Manifest ({astronauts.length})
              </h2>
            </div>

            {/* Search Box */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by name or ID..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-[#070c14] border border-[#1c2738] text-xs text-white focus:border-sky-500 font-mono"
              />
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
              {filteredAstronauts.map(astro => (
                <button
                  key={astro.id}
                  onClick={() => selectAstronaut(astro)}
                  className={`w-full p-2.5 text-left border transition-colors ${
                    selectedAstro?.id === astro.id
                      ? 'bg-[#101a2b] border-sky-500/60'
                      : 'bg-[#070c14] border-[#1c2738] hover:bg-[#0b121e]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white">{astro.name}</span>
                    {astro.unresolved_alerts > 0 && (
                      <span className="px-1 py-0.2 text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        {astro.unresolved_alerts} alerts
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {astro.astronaut_id} • MD-{astro.mission_day}
                  </div>
                </button>
              ))}

              {filteredAstronauts.length === 0 && (
                <div className="py-4 text-center text-xs text-slate-500 font-mono">
                  No matching crew found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Astronaut Workspace */}
        <div className="lg:col-span-3 space-y-4">
          {selectedAstro ? (
            <>
              {/* Profile Bar */}
              <div className="aero-panel p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1c2738]">
                  <div>
                    <span className="text-[10px] font-mono text-sky-400 uppercase">ASTRONAUT RECORD</span>
                    <h2 className="text-base font-semibold text-white">{selectedAstro.name}</h2>
                    <p className="text-[11px] text-slate-400 font-mono">
                      ID: {selectedAstro.astronaut_id} • Mission: {selectedAstro.mission_name} (MD-{selectedAstro.mission_day})
                    </p>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Shared Database Sync: <strong className="text-emerald-400">LIVE</strong>
                  </div>
                </div>

                {/* Vitals Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs font-mono">
                  <div className="p-2.5 bg-[#070c14] border border-[#1c2738]">
                    <span className="text-slate-500 text-[10px] block">LATEST HR</span>
                    <strong className="text-white telemetry-val text-sm">
                      {selectedAstro.last_reading?.heart_rate ? `${selectedAstro.last_reading.heart_rate} bpm` : '--'}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-[#070c14] border border-[#1c2738]">
                    <span className="text-slate-500 text-[10px] block">LATEST BP</span>
                    <strong className="text-white telemetry-val text-sm">
                      {selectedAstro.last_reading?.blood_pressure || '--'}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-[#070c14] border border-[#1c2738]">
                    <span className="text-slate-500 text-[10px] block">CORE TEMP</span>
                    <strong className="text-white telemetry-val text-sm">
                      {selectedAstro.last_reading?.temperature ? `${selectedAstro.last_reading.temperature} °C` : '--'}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-[#070c14] border border-[#1c2738]">
                    <span className="text-slate-500 text-[10px] block">SLEEP</span>
                    <strong className="text-white telemetry-val text-sm">
                      {selectedAstro.last_reading?.sleep_duration ? `${selectedAstro.last_reading.sleep_duration} hrs` : '--'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* View 1: Crew Monitoring Overview */}
              {activeSubTab === 'crew-monitoring' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Active Alerts for this crew */}
                    <div className="aero-panel p-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Active Telemetry Alerts ({selectedAlerts.filter(a => !a.resolved).length})
                      </h3>
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {selectedAlerts.filter(a => !a.resolved).map(a => (
                          <div key={a.id} className="p-2 bg-[#070c14] border border-[#1c2738] text-xs">
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-200">{a.title}</span>
                              <span className="text-[9px] font-mono uppercase text-amber-400">{a.severity}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">{a.description}</p>
                          </div>
                        ))}
                        {selectedAlerts.filter(a => !a.resolved).length === 0 && (
                          <div className="py-8 text-center text-xs text-slate-500">Zero active alerts flagged for this astronaut.</div>
                        )}
                      </div>
                    </div>

                    {/* Recent Clinical Reviews */}
                    <div className="aero-panel p-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-sky-400" />
                        Recent Clinical Reviews ({notes.length})
                      </h3>
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {notes.map(n => (
                          <div key={n.id} className="p-2 bg-[#070c14] border border-[#1c2738] text-xs space-y-1">
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-200">{n.title}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{new Date(n.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2">{n.content}</p>
                          </div>
                        ))}
                        {notes.length === 0 && (
                          <div className="py-8 text-center text-xs text-slate-500">No medical reviews authored yet.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* View 2: Full Astronaut Records Table */}
              {activeSubTab === 'astronaut-records' && (
                <div className="aero-panel overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-[#1c2738] flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-semibold uppercase">
                      Telemetry History: {selectedAstro.name} ({selectedRecords.length} Readings)
                    </span>
                    <span className="text-slate-500 text-[11px]">SORT: CHRONOLOGICAL</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#070c14] text-slate-400 border-b border-[#1c2738] font-mono text-[11px]">
                          <th className="py-2 px-3">Date (UTC)</th>
                          <th className="py-2 px-3">HR (BPM)</th>
                          <th className="py-2 px-3">BP (mmHg)</th>
                          <th className="py-2 px-3">Temp (°C)</th>
                          <th className="py-2 px-3">Sleep</th>
                          <th className="py-2 px-3">Stress</th>
                          <th className="py-2 px-3">Source</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1c2738] font-mono text-[11px]">
                        {selectedRecords.slice().reverse().map(rec => (
                          <tr key={rec.id} className="hover:bg-[#101a2b]">
                            <td className="py-2 px-3 text-slate-300">{new Date(rec.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                            <td className="py-2 px-3 telemetry-val">{rec.heart_rate ?? '--'}</td>
                            <td className="py-2 px-3 telemetry-val">{rec.blood_pressure_sys ? `${rec.blood_pressure_sys}/${rec.blood_pressure_dia}` : '--'}</td>
                            <td className="py-2 px-3 telemetry-val">{rec.body_temperature ?? '--'}</td>
                            <td className="py-2 px-3 telemetry-val">{rec.sleep_duration ? `${rec.sleep_duration}h` : '--'}</td>
                            <td className="py-2 px-3 telemetry-val">{rec.stress_level ? `${rec.stress_level}/10` : '--'}</td>
                            <td className="py-2 px-3">
                              <span className="px-1 py-0.2 border border-slate-700 text-slate-400 text-[10px]">
                                {rec.data_source}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* View 3: Medical Reviews & Clinical Notes Authoring */}
              {activeSubTab === 'medical-reviews' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Author Note Form */}
                  <div className="aero-panel p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-sky-400" />
                      Author Clinical Review Note
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">
                      Committed reviews are saved to SQLite and immediately shared with {selectedAstro.name}.
                    </p>

                    <form onSubmit={handleAddNote} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 font-mono mb-1">Subject / Review Directive</label>
                        <input
                          type="text" value={title} onChange={e => setTitle(e.target.value)} required
                          placeholder="e.g. Circadian rest period extension"
                          className="w-full px-2.5 py-1.5 bg-[#070c14] border border-[#1c2738] text-white focus:border-sky-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-mono mb-1">Surgeon Assessment & Evaluation</label>
                        <textarea
                          value={content} onChange={e => setContent(e.target.value)} required rows={3}
                          placeholder="Clinical observations based on telemetry..."
                          className="w-full px-2.5 py-1.5 bg-[#070c14] border border-[#1c2738] text-white focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-mono mb-1">Prescribed Action / Countermeasure</label>
                        <input
                          type="text" value={recommendation} onChange={e => setRecommendation(e.target.value)}
                          placeholder="e.g. Increase hydration by 500 mL and schedule 15m rest."
                          className="w-full px-2.5 py-1.5 bg-[#070c14] border border-[#1c2738] text-white focus:border-sky-500 font-mono"
                        />
                      </div>

                      <button
                        type="submit" disabled={submittingNote}
                        className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-mono uppercase tracking-wider disabled:opacity-50"
                      >
                        {submittingNote ? 'Committing...' : 'Commit Medical Review'}
                      </button>
                    </form>
                  </div>

                  {/* History of Reviews for this astronaut */}
                  <div className="aero-panel p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        Clinical History: {selectedAstro.name} ({notes.length})
                      </h3>

                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {notes.map(note => (
                          <div key={note.id} className="p-2.5 bg-[#070c14] border border-[#1c2738] text-xs space-y-1">
                            <div className="flex items-center justify-between font-medium">
                              <span className="text-slate-200">{note.title}</span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(note.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-400 text-[11px] leading-relaxed">{note.content}</p>
                            {note.recommendation && (
                              <div className="text-[10px] text-sky-400 font-mono pt-1">
                                DIRECTIVE: {note.recommendation}
                              </div>
                            )}
                          </div>
                        ))}

                        {notes.length === 0 && (
                          <div className="py-8 text-center text-xs text-slate-500">
                            No reviews entered for this astronaut yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-10 text-center aero-panel text-xs text-slate-500 font-mono">
              Select an astronaut from the roster manifest.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
