import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminBackupPanel() {
  const [status, setStatus] = useState('idle');
  const [statusObj, setStatusObj] = useState(null);
  const [polling, setPolling] = useState(false);
  const [history, setHistory] = useState([]);
  // Use shared axios `api` instance (it supplies Authorization header)

  useEffect(() => { fetchHistory(); }, []);

  // Poll backup status while a job is running
  useEffect(() => {
    let id;
    const startPolling = async () => {
      const s = await fetchStatus();
      if (s && s.status === 'running') {
        id = setInterval(async () => {
          const cur = await fetchStatus();
          if (!cur || cur.status !== 'running') {
            clearInterval(id);
            setPolling(false);
            // ensure history refresh after completion
            fetchHistory();
          }
        }, 3000);
      } else {
        setPolling(false);
      }
    };
    if (polling) startPolling();
    return () => { if (id) clearInterval(id); };
  }, [polling]);

  async function fetchHistory() {
    try {
      const res = await api.get('/backup/history');
      setHistory(res.data.jobs || []);
    } catch (e) {
      console.error('Failed to fetch history', e?.response?.data || e.message);
    }
  }

  async function fetchStatus() {
    try {
      const res = await api.get('/backup/status');
      const s = res.data.status || res.data || null;
      setStatusObj(s);
      return s;
    } catch (e) {
      console.error('Failed to fetch status', e?.response?.data || e.message);
      return null;
    }
  }

  async function startBackup() {
    setStatus('running');
    try {
      const res = await api.post('/backup/start', {});
      alert('Backup started');
      // update history and start polling status
      await fetchHistory();
      setPolling(true);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Request failed';
      alert('Backup error: ' + msg);
      console.error('startBackup error', err?.response || err);
    } finally {
      setStatus('idle');
    }
  }

  async function downloadBackup(fileId) {
    try {
      const res = await api.get('/backup/download', { params: { fileId }, responseType: 'blob' });
      const blob = res.data;
      const contentDisposition = res.headers['content-disposition'] || '';
      let filename = fileId;
      const m = /filename\*=UTF-8''(.+)$/.exec(contentDisposition) || /filename="?([^";]+)"?/.exec(contentDisposition);
      if (m && m[1]) filename = decodeURIComponent(m[1]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Download failed';
      alert('Download error: ' + msg);
      console.error('downloadBackup error', err?.response || err);
    }
  }

  async function restoreBackup(fileId, target = 'tourdb_restore', confirmation = null) {
    if (!confirm(`Restore backup ${fileId} into ${target}?`)) return;
    setStatus('restoring');
    try {
      const body = { fileId, targetDb: target };
      if (confirmation) body.confirmation = confirmation;
      const res = await api.post('/backup/restore', body);
      alert('Restore started');
      await fetchHistory();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Restore failed';
      alert('Restore error: ' + msg);
      console.error('restoreBackup error', err?.response || err);
    }
    setStatus('idle');
  }

  return (
    <div className="p-3 rounded bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Backup & Restore</h3>
        <button onClick={startBackup} disabled={status==='running' || polling} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">{(status==='running' || polling) ? 'Running...' : 'Backup Now'}</button>
      </div>
      <div className="mt-3">
        <h4 className="font-medium text-sm text-gray-700">Recent Backups</h4>
        <div className="mt-2 max-h-64 overflow-y-auto">
          <ul className="space-y-2">
            {(() => {
              const recent = (history || [])
                .filter(j => j && j.driveFileId)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3);
              if (recent.length === 0) return <li className="text-sm text-gray-500">No recent Drive backups</li>;
              return recent.map(job => (
                <li key={job._id} className="flex items-start justify-between p-2 bg-gray-50 rounded">
                  <div className="min-w-0">
                    <div className="font-medium text-sm break-words max-w-[220px]">{job.driveFileId}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(job.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap items-center ml-3">
                    <button onClick={() => downloadBackup(job.driveFileId)} className="px-2 py-1 text-xs border rounded whitespace-nowrap bg-white">Download</button>
                    {job.summaryDriveFileId && <button onClick={() => downloadBackup(job.summaryDriveFileId)} className="px-2 py-1 text-xs border rounded whitespace-nowrap bg-white">Summary</button>}
                    <button onClick={() => restoreBackup(job.driveFileId, 'tourdb_restore')} className="px-2 py-1 text-xs border rounded whitespace-nowrap bg-white">Restore</button>
                    <button onClick={() => { const ok = confirm('Restore to production? This is destructive. Click OK to continue.'); if (!ok) return; const typed = prompt('Type RESTORE_PRODUCTION to confirm'); if (typed === 'RESTORE_PRODUCTION') restoreBackup(job.driveFileId, 'tourdb', 'RESTORE_PRODUCTION'); else alert('Confirmation failed'); }} className="px-2 py-1 text-xs bg-red-600 text-white rounded whitespace-nowrap">Prod</button>
                  </div>
                </li>
              ));
            })()}
          </ul>
        </div>
      </div>
    </div>
  );
}
