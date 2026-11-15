import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { FileText, Clock, Stethoscope, ShieldCheck } from 'lucide-react';

interface MedicalReviewsViewProps {
  astronautId?: number;
}

export const MedicalReviewsView: React.FC<MedicalReviewsViewProps> = ({ astronautId }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotes = async () => {
    try {
      const res = await api.getMedicalNotes(astronautId);
      setNotes(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [astronautId]);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="pb-3 border-b border-[#1c2738]">
        <h1 className="text-base font-semibold text-slate-100 uppercase tracking-wide flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-sky-400" />
          Flight Surgeon Medical Reviews & Clinical Notes
        </h1>
        <p className="text-xs text-slate-400">
          Official telemedicine review summaries, physiological directives, and countermeasure adjustments.
        </p>
      </div>

      {/* Medical Notes Feed */}
      <div className="space-y-3">
        {notes.map(note => (
          <div key={note.id} className="aero-panel p-4 border border-[#1c2738] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <h2 className="text-sm font-semibold text-white">{note.title}</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(note.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pl-4 border-l border-slate-800">
              {note.content}
            </p>

            {note.recommendation && (
              <div className="mt-2 p-2.5 bg-[#070c14] border border-[#1c2738] text-xs space-y-0.5">
                <strong className="text-sky-400 font-mono text-[10px] uppercase block">
                  Prescribed Clinical Directive:
                </strong>
                <span className="text-slate-200">{note.recommendation}</span>
              </div>
            )}
          </div>
        ))}

        {notes.length === 0 && !loading && (
          <div className="p-10 text-center aero-panel">
            <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h3 className="text-xs font-semibold uppercase text-slate-300 font-mono">No Clinical Notes Logged</h3>
            <p className="text-xs text-slate-500 mt-1">No notes recorded yet by the Flight Surgeon.</p>
          </div>
        )}
      </div>
    </div>
  );
};
