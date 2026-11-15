import React, { useState } from 'react';
import { Alert } from '../../types';
import { api } from '../../api';
import { 
  AlertTriangle, 
  Check, 
  CheckCheck, 
  Clock, 
  CheckCircle2
} from 'lucide-react';

interface AlertsViewProps {
  alerts: Alert[];
  onRefresh: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts, onRefresh }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE');

  const handleAcknowledge = async (id: number) => {
    try {
      await api.acknowledgeAlert(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await api.resolveAlert(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterStatus === 'ACTIVE' && a.resolved) return false;
    if (filterStatus === 'RESOLVED' && !a.resolved) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1c2738]">
        <div>
          <h1 className="text-base font-semibold text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Early Warning Alert System
          </h1>
          <p className="text-xs text-slate-400">
            Rule-based threshold alerts and anomaly events with validated flight medical response protocols.
          </p>
        </div>

        {/* Minimal Dropdown Filters */}
        <div className="flex items-center gap-2">
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
            className="px-2.5 py-1 bg-[#0b121e] border border-[#1c2738] text-xs text-slate-300 font-mono"
          >
            <option value="ALL">Severity: All</option>
            <option value="URGENT">Urgent Only</option>
            <option value="ATTENTION">Attention Only</option>
            <option value="INFO">Info Only</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-2.5 py-1 bg-[#0b121e] border border-[#1c2738] text-xs text-slate-300 font-mono"
          >
            <option value="ACTIVE">Status: Active</option>
            <option value="RESOLVED">Status: Resolved</option>
            <option value="ALL">Status: All</option>
          </select>
        </div>
      </div>

      {/* Alert Cards: Crisp, Minimal & Readable */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => {
          const isUrgent = alert.severity === 'URGENT';
          const isAttention = alert.severity === 'ATTENTION';

          return (
            <div
              key={alert.id}
              className={`p-4 aero-panel border transition-all ${
                alert.resolved
                  ? 'border-[#1c2738] opacity-60'
                  : isUrgent
                  ? 'border-rose-900/80 bg-rose-950/15'
                  : isAttention
                  ? 'border-amber-900/70 bg-amber-950/10'
                  : 'border-[#1c2738]'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase border ${
                      isUrgent ? 'border-rose-600 text-rose-300 bg-rose-950/50' :
                      isAttention ? 'border-amber-600 text-amber-300 bg-amber-950/50' :
                      'border-sky-600 text-sky-300 bg-sky-950/50'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">[{alert.category}]</span>
                    {alert.related_parameter && (
                      <span className="text-[10px] font-mono text-slate-400">Param: {alert.related_parameter}</span>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 ml-auto">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white">{alert.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

                  <div className="pt-2 text-xs grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-400">
                    <div className="bg-[#070c14] p-2 border border-[#1c2738]">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">Biological Mechanism</span>
                      <span className="text-slate-300 text-[11px]">{alert.reason}</span>
                    </div>
                    <div className="bg-[#070c14] p-2 border border-[#1c2738]">
                      <span className="text-[10px] uppercase font-mono text-sky-400 block">Approved Medical Protocol</span>
                      <span className="text-slate-200 text-[11px] font-medium">{alert.recommended_action}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col items-center gap-2 shrink-0 pt-1">
                  {!alert.acknowledged && !alert.resolved && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}

                  {!alert.resolved && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-2.5 py-1 text-xs font-mono bg-[#0b121e] hover:bg-emerald-950/40 text-emerald-300 border border-emerald-800 transition-colors flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>Resolve</span>
                    </button>
                  )}

                  {alert.resolved && (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="p-10 text-center aero-panel">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
            <h3 className="text-xs font-semibold uppercase text-slate-200 font-mono">No Matching Alerts</h3>
            <p className="text-xs text-slate-500 mt-1">All telemetry monitoring thresholds are currently satisfied.</p>
          </div>
        )}
      </div>
    </div>
  );
};
