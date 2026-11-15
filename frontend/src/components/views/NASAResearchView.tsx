import React, { useState, useEffect } from 'react';
import { DatasetDetails } from '../../types';
import { api } from '../../api';
import { 
  Database, 
  Upload, 
  Table
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const NASAResearchView: React.FC = () => {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<DatasetDetails | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadDatasetList = async () => {
    try {
      const list = await api.listDatasets();
      setDatasets(list);
      if (list.length > 0 && !selectedDataset) {
        loadDetails(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadDetails = async (id: number) => {
    try {
      const details = await api.getDataset(id);
      setSelectedDataset(details);
    } catch (err: any) {
      alert(`Error loading dataset: ${err.message}`);
    }
  };

  useEffect(() => {
    loadDatasetList();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const details = await api.uploadDataset(file);
      setSelectedDataset(details);
      await loadDatasetList();
      alert(`Dataset '${file.name}' ingested successfully.`);
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const summaryChartData = selectedDataset?.numeric_summary
    ? Object.entries(selectedDataset.numeric_summary).map(([col, stats]) => ({
        col: col.replace(/_/g, ' ').slice(0, 14),
        mean: stats.mean,
        max: stats.max
      }))
    : [];

  return (
    <div className="space-y-4">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1c2738]">
        <div>
          <h1 className="text-base font-semibold text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400" />
            NASA Research Data Center (OSDR / OSD-575)
          </h1>
          <p className="text-xs text-slate-400">
            Biomedical omics, cytokines, and cellular research data (SpaceX Inspiration4).
          </p>
        </div>

        <div>
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono uppercase tracking-wider transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Processing...' : 'Upload Study File'}</span>
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Dataset Selection Tabs */}
      {datasets.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-mono text-slate-500 uppercase">STUDIES:</span>
          {datasets.map(d => (
            <button
              key={d.id}
              onClick={() => loadDetails(d.id)}
              className={`px-2.5 py-1 text-xs font-mono transition-colors ${
                selectedDataset?.id === d.id
                  ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {d.study_identifier} ({d.filename})
            </button>
          ))}
        </div>
      )}

      {/* Metadata Strip */}
      {selectedDataset && (
        <div className="aero-panel p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#1c2738]">
            <div>
              <span className="text-[10px] font-mono uppercase text-sky-400">
                {selectedDataset.study_identifier} • {selectedDataset.source}
              </span>
              <h2 className="text-sm font-semibold text-white">{selectedDataset.title}</h2>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="px-2 py-1 bg-[#070c14] border border-[#1c2738]">
                <span className="text-slate-500 text-[10px] block">ROWS</span>
                <strong className="text-white">{selectedDataset.rows_count}</strong>
              </div>
              <div className="px-2 py-1 bg-[#070c14] border border-[#1c2738]">
                <span className="text-slate-500 text-[10px] block">COLUMNS</span>
                <strong className="text-sky-400">{selectedDataset.columns_count}</strong>
              </div>
              <div className="px-2 py-1 bg-[#070c14] border border-[#1c2738]">
                <span className="text-slate-500 text-[10px] block">DUPLICATES</span>
                <strong className="text-emerald-400">{selectedDataset.duplicate_count}</strong>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-[10px] font-mono uppercase text-slate-400 mb-1.5">Detected Schema & Attributes:</h3>
            <div className="flex flex-wrap gap-1.5">
              {selectedDataset.columns.map(col => {
                const type = selectedDataset.column_types?.[col] || 'String';
                const missingPct = selectedDataset.missing_percentages?.[col] || 0;
                return (
                  <span key={col} className="px-2 py-0.5 bg-[#070c14] border border-[#1c2738] text-[11px] font-mono text-slate-300">
                    {col} <span className="text-sky-400 text-[10px]">({type})</span>
                    {missingPct > 0 && <span className="text-amber-400 ml-1">[{missingPct}% null]</span>}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Distribution Chart */}
      {summaryChartData.length > 0 && (
        <div className="aero-panel p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-2">
            Research Parameter Means & Distributions
          </h2>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryChartData} margin={{ top: 5, right: 5, left: -25, bottom: 20 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1c2738" vertical={false} />
                <XAxis dataKey="col" stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} interval={0} angle={-10} textAnchor="end" />
                <YAxis stroke="#475569" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0b121e', borderColor: '#1c2738', fontSize: '11px', borderRadius: '2px' }} />
                <Bar dataKey="mean" fill="#0ea5e9" name="Mean" radius={[2, 2, 0, 0]} />
                <Bar dataKey="max" fill="#818cf8" name="Max" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Preview Table */}
      {selectedDataset?.preview_rows && selectedDataset.preview_rows.length > 0 && (
        <div className="aero-panel overflow-hidden">
          <div className="px-4 py-2 border-b border-[#1c2738] flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5 text-sky-400" /> Study Ingestion Sample (First 10 Rows)
            </span>
            <span className="text-slate-500 font-mono text-[11px]">Unmodified Experimental Values</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#070c14] text-slate-400 border-b border-[#1c2738] font-mono text-[11px]">
                  {selectedDataset.columns.map(col => (
                    <th key={col} className="py-2 px-2.5 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2738] font-mono text-[11px]">
                {selectedDataset.preview_rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#101a2b]">
                    {selectedDataset.columns.map(col => (
                      <td key={col} className="py-1.5 px-2.5 text-slate-300 whitespace-nowrap">
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-slate-600">null</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
