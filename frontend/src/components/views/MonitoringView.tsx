import React, { useState } from 'react';
import { HealthRecord } from '../../types';
import { api } from '../../api';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Activity, 
  X
} from 'lucide-react';

interface MonitoringViewProps {
  records: HealthRecord[];
  onRefresh: () => void;
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({ records, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);

  // Form states
  const [heartRate, setHeartRate] = useState<string>('72');
  const [bpSys, setBpSys] = useState<string>('120');
  const [bpDia, setBpDia] = useState<string>('80');
  const [bodyTemp, setBodyTemp] = useState<string>('36.8');
  const [bloodGlucose, setBloodGlucose] = useState<string>('95');
  const [sleepDuration, setSleepDuration] = useState<string>('7.5');
  const [activityMin, setActivityMin] = useState<string>('60');
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [moodRating, setMoodRating] = useState<number>(4);
  const [dataSource, setDataSource] = useState<'MANUAL' | 'SIMULATED'>('MANUAL');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingRecord(null);
    setHeartRate('72');
    setBpSys('120');
    setBpDia('80');
    setBodyTemp('36.8');
    setBloodGlucose('95');
    setSleepDuration('7.5');
    setActivityMin('60');
    setStressLevel(3);
    setMoodRating(4);
    setDataSource('MANUAL');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (rec: HealthRecord) => {
    setEditingRecord(rec);
    setHeartRate(rec.heart_rate?.toString() || '');
    setBpSys(rec.blood_pressure_sys?.toString() || '');
    setBpDia(rec.blood_pressure_dia?.toString() || '');
    setBodyTemp(rec.body_temperature?.toString() || '');
    setBloodGlucose(rec.blood_glucose?.toString() || '');
    setSleepDuration(rec.sleep_duration?.toString() || '');
    setActivityMin(rec.physical_activity_minutes?.toString() || '');
    setStressLevel(rec.stress_level || 3);
    setMoodRating(rec.mood_rating || 4);
    setDataSource(rec.data_source === 'SIMULATED' ? 'SIMULATED' : 'MANUAL');
    setNotes(rec.notes || '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: Partial<HealthRecord> = {
        heart_rate: heartRate ? parseFloat(heartRate) : undefined,
        blood_pressure_sys: bpSys ? parseFloat(bpSys) : undefined,
        blood_pressure_dia: bpDia ? parseFloat(bpDia) : undefined,
        body_temperature: bodyTemp ? parseFloat(bodyTemp) : undefined,
        blood_glucose: bloodGlucose ? parseFloat(bloodGlucose) : undefined,
        sleep_duration: sleepDuration ? parseFloat(sleepDuration) : undefined,
        physical_activity_minutes: activityMin ? parseFloat(activityMin) : undefined,
        stress_level: stressLevel,
        mood_rating: moodRating,
        data_source: dataSource,
        notes: notes || undefined
      };

      if (editingRecord) {
        await api.updateHealthRecord(editingRecord.id, payload);
      } else {
        await api.createHealthRecord(payload);
      }

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error saving record: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this telemetry entry?')) return;
    try {
      await api.deleteHealthRecord(id);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1c2738]">
        <div>
          <h1 className="text-base font-semibold text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            Biometric Telemetry & Manual Logs
          </h1>
          <p className="text-xs text-slate-400">
            Chronological register of astronaut health readings with strict provenance classification.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium uppercase tracking-wider transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Clean Telemetry Table */}
      <div className="aero-panel overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#1c2738] flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Historical Records ({records.length})
          </span>
          <span className="text-slate-500 font-mono text-[11px]">ORDER: CHRONOLOGICAL</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#070c14] text-slate-400 border-b border-[#1c2738] font-mono text-[11px]">
                <th className="py-2 px-3">Date (UTC)</th>
                <th className="py-2 px-3">Heart Rate</th>
                <th className="py-2 px-3">Blood Pressure</th>
                <th className="py-2 px-3">Temp</th>
                <th className="py-2 px-3">Sleep</th>
                <th className="py-2 px-3">Stress</th>
                <th className="py-2 px-3">Source</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2738] font-mono">
              {records.slice().reverse().map(record => (
                <tr key={record.id} className="hover:bg-[#101a2b] transition-colors">
                  <td className="py-2.5 px-3 text-slate-300">
                    {new Date(record.timestamp).toLocaleString(undefined, { 
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </td>
                  <td className="py-2.5 px-3 telemetry-val">
                    {record.heart_rate ? `${record.heart_rate} bpm` : '--'}
                  </td>
                  <td className="py-2.5 px-3 telemetry-val">
                    {record.blood_pressure_sys ? `${record.blood_pressure_sys}/${record.blood_pressure_dia}` : '--'}
                  </td>
                  <td className="py-2.5 px-3 telemetry-val">
                    {record.body_temperature ? `${record.body_temperature} °C` : '--'}
                  </td>
                  <td className="py-2.5 px-3 telemetry-val">
                    {record.sleep_duration ? `${record.sleep_duration} h` : '--'}
                  </td>
                  <td className="py-2.5 px-3 telemetry-val">
                    {record.stress_level ? `${record.stress_level}/10` : '--'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.5 text-[10px] border ${
                      record.data_source === 'MANUAL'
                        ? 'border-indigo-800 text-indigo-300 bg-indigo-950/40'
                        : 'border-slate-700 text-slate-400 bg-slate-900/40'
                    }`}>
                      {record.data_source}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(record)}
                        className="p-1 hover:text-sky-400 text-slate-400 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-1 hover:text-rose-400 text-slate-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {records.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    No records found. Click "New Entry" to log data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg bg-[#0b121e] border border-[#2a384e] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2738] mb-4">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                {editingRecord ? 'Edit Biometric Entry' : 'Manual Biometric Check-In'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Heart Rate (BPM)</label>
                  <input
                    type="number" step="0.1" value={heartRate} onChange={e => setHeartRate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#070c14] border border-[#1c2738] text-white focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Core Temp (°C)</label>
                  <input
                    type="number" step="0.1" value={bodyTemp} onChange={e => setBodyTemp(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#070c14] border border-[#1c2738] text-white focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number" step="0.1" value={bpSys} onChange={e => setBpSys(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#070c14] border border-[#1c2738] text-white focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number" step="0.1" value={bpDia} onChange={e => setBpDia(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#070c14] border border-[#1c2738] text-white focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Sleep Duration (hrs)</label>
                  <input
                    type="number" step="0.1" value={sleepDuration} onChange={e => setSleepDuration(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#070c14] border border-[#1c2738] text-white focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Exercise (mins)</label>
                  <input
                    type="number" step="1" value={activityMin} onChange={e => setActivityMin(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#070c14] border border-[#1c2738] text-white focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">
                  Subjective Stress Index: <strong className="text-white">{stressLevel}/10</strong>
                </label>
                <input
                  type="range" min="1" max="10" value={stressLevel} onChange={e => setStressLevel(parseInt(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Telemetry Origin</label>
                <select
                  value={dataSource} onChange={e => setDataSource(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-[#070c14] border border-[#1c2738] text-white focus:border-sky-500 font-mono"
                >
                  <option value="MANUAL">MANUAL (Self-Reported Entry)</option>
                  <option value="SIMULATED">SIMULATED (Telemetry Stream)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Clinical Context / Notes</label>
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  placeholder="Optional observations..."
                  className="w-full px-2.5 py-1.5 bg-[#070c14] border border-[#1c2738] text-white focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1c2738]">
                <button
                  type="button" onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
