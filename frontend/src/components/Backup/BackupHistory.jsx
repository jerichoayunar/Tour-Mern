import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const humanBytes = (n) => {
  if (!n && n !== 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let v = Number(n);
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(1)} ${units[i]}`;
};

const IconStatus = ({ status }) => {
  if (!status) return null;
  if (status === 'success' || status === 'completed') {
    return (
      <span className="text-green-600 mr-2">✔</span>
    );
  }
  if (status === 'failed' || status === 'error') {
    return (
      <span className="text-red-600 mr-2">✖</span>
    );
  }
  return <span className="text-gray-500 mr-2">●</span>;
};

const BackupHistory = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);
  const [expanded, setExpanded] = useState(new Set());

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/backup/history');
      setJobs(res.data.jobs || []);
      setPage(1); // reset to first page on refresh
    } catch (err) {
      console.warn('History fetch failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const total = jobs.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const pageItems = jobs.slice(start, start + perPage);

  const toggleExpand = (id) => {
    const s = new Set(expanded);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setExpanded(s);
  };

  const showAll = () => setExpanded(new Set(jobs.map((j) => j._id)));
  const hideAll = () => setExpanded(new Set());

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Backup History</h3>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">{total} items</div>
          <button onClick={fetchHistory} disabled={loading} className="text-sm text-blue-600 hover:underline">
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={showAll} className="text-sm text-blue-600 hover:underline">Show all</button>
          <button onClick={hideAll} className="text-sm text-gray-600 hover:underline">Hide all</button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Per page:</label>
          <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="text-sm border rounded px-2 py-1">
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={12}>12</option>
            <option value={25}>25</option>
          </select>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {total === 0 && <div className="text-sm text-gray-500">No backups yet.</div>}

        {pageItems.map((j) => (
          <div key={j._id} className="flex items-start gap-3 p-3 bg-white rounded-md shadow-sm">
            <div className="shrink-0 pt-1"><IconStatus status={j.status} /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="font-medium truncate max-w-[60%]">{j.type || 'manual'}</div>
                <div className="text-xs text-gray-500">{new Date(j.startedAt).toLocaleString()}</div>
              </div>

              <div className="mt-1 flex items-center justify-between">
                <div className="text-sm text-gray-600">Status: <span className="font-medium">{j.status}</span></div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">Size: {humanBytes(j.sizeBytes)}</div>
                  <button onClick={() => toggleExpand(j._id)} className="text-sm text-blue-600 hover:underline">
                    {expanded.has(j._id) ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {expanded.has(j._id) && (
                <div className="mt-2 text-sm text-gray-700">
                  {j.driveFileId && <div className="break-all">Drive ID: {j.driveFileId}</div>}
                  {j.error && <div className="text-sm text-red-600 mt-1">Error: {j.error}</div>}
                  {j.files && j.files.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium">Files included</div>
                      <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                        {j.files.map((f, idx) => (
                          <li key={idx} className="break-all">{f.name} — {humanBytes(f.size)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Page {page} of {pages}</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 bg-gray-100 rounded disabled:opacity-50">Prev</button>
          <button disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))} className="px-2 py-1 bg-gray-100 rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default BackupHistory;
