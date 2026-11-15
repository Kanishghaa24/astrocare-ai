import React, { useState, useEffect } from 'react';
import { MentalWellnessRecord } from '../../types';
import { api } from '../../api';
import { 
  Smile, 
  Wind, 
  Play, 
  Pause, 
  RotateCcw
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface MentalWellnessViewProps {
  records: MentalWellnessRecord[];
  onRefresh: () => void;
}

export const MentalWellnessView: React.FC<MentalWellnessViewProps> = ({ records, onRefresh }) => {
  // Check-in state
  const [mood, setMood] = useState<number>(4);
  const [stress, setStress] = useState<number>(3);
  const [confinement, setConfinement] = useState<number>(2);
  const [clarity, setClarity] = useState<number>(4);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Guided Breathing Exercise (Box Breathing: 4s inhale, 4s hold, 4s exhale, 4s hold)
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold (Top)' | 'Exhale' | 'Hold (Empty)'>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);

  useEffect(() => {
    let timer: any;
    if (breathingActive) {
      timer = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev > 1) return prev - 1;
          setBreathingPhase(curr => {
            if (curr === 'Inhale') return 'Hold (Top)';
            if (curr === 'Hold (Top)') return 'Exhale';
            if (curr === 'Exhale') return 'Hold (Empty)';
            return 'Inhale';
          });
          return 4;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [breathingActive]);

  const handleSubmitCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createWellness({
        mood_rating: mood,
        stress_rating: stress,
        sleep_quality: 4,
        confinement_fatigue: confinement,
        social_cohesion: 5,
        cognitive_clarity: clarity,
        notes: notes || undefined
      });
      setNotes('');
      onRefresh();
      alert('Behavioral assessment logged securely.');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = records.slice(-10).map(r => ({
    date: new Date(r.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    mood: r.mood_rating,
    stress: r.stress_rating,
    clarity: r.cognitive_clarity
  }));

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="pb-3 border-b border-[#1c2738]">
        <h1 className="text-base font-semibold text-slate-100 uppercase tracking-wide flex items-center gap-2">
          <Smile className="w-4 h-4 text-sky-400" />
          Behavioral Health & Confinement Tracking
        </h1>
        <p className="text-xs text-slate-400">
          Standardized astronaut behavioral self-assessment and autonomic regulation countermeasures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Assessment Form */}
        <div className="lg:col-span-2 aero-panel p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1">
            Daily Psychological Self-Assessment
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Confidential responses accessible exclusively by the Flight Surgeon.
          </p>

          <form onSubmit={handleSubmitCheckin} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Overall Mood (1-5): <strong className="text-sky-400">{mood}/5</strong>
                </label>
                <input
                  type="range" min="1" max="5" value={mood}
                  onChange={e => setMood(parseInt(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Subjective Stress (1-10): <strong className="text-amber-400">{stress}/10</strong>
                </label>
                <input
                  type="range" min="1" max="10" value={stress}
                  onChange={e => setStress(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Confinement Fatigue (1-5): <strong className="text-rose-400">{confinement}/5</strong>
                </label>
                <input
                  type="range" min="1" max="5" value={confinement}
                  onChange={e => setConfinement(parseInt(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Cognitive Focus (1-5): <strong className="text-emerald-400">{clarity}/5</strong>
                </label>
                <input
                  type="range" min="1" max="5" value={clarity}
                  onChange={e => setClarity(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Confidential Operational Log</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional notes regarding crew cohesion, sleep station comfort, or workload..."
                className="w-full px-2.5 py-1.5 bg-[#070c14] border border-[#1c2738] text-xs text-white focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Log Assessment'}
            </button>
          </form>
        </div>

        {/* Box Breathing Tool: Clean & Minimal */}
        <div className="aero-panel p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1 flex items-center gap-2">
              <Wind className="w-3.5 h-3.5 text-sky-400" />
              Box Breathing Regulation
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              4-4-4-4 technique for sympathetic down-regulation.
            </p>

            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-28 h-28 border border-[#2a384e] bg-[#070c14] flex flex-col items-center justify-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  {breathingActive ? breathingPhase : 'READY'}
                </span>
                <span className="text-3xl font-mono font-semibold text-white mt-1">
                  {breathingActive ? secondsLeft : '4'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-3 border-t border-[#1c2738]">
            <button
              onClick={() => setBreathingActive(!breathingActive)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              {breathingActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{breathingActive ? 'Pause' : 'Start (4m)'}</span>
            </button>
            {breathingActive && (
              <button
                onClick={() => { setBreathingActive(false); setSecondsLeft(4); setBreathingPhase('Inhale'); }}
                className="p-1.5 bg-slate-800 text-slate-300 hover:text-white"
                title="Reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Wellness Trends */}
      <div className="aero-panel p-4">
        <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
          10-Day Psychological Wellness Trends
        </h2>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1c2738" vertical={false} />
              <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis stroke="#475569" domain={[1, 10]} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0b121e', borderColor: '#1c2738', fontSize: '11px', borderRadius: '2px' }} />
              <Line type="monotone" dataKey="mood" name="Mood" stroke="#0ea5e9" strokeWidth={1.5} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="stress" name="Stress" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="clarity" name="Focus" stroke="#10b981" strokeWidth={1.5} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
