import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const BackupStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/backup/status');
      setStatus(res.data.status || res.data);
      setLastFetched(new Date());
    } catch (err) {
      console.warn('Status fetch failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 5000);
    return () => clearInterval(id);
  }, []);

  if (!status) {
    return (
      <div>
        <h4 className="text-sm font-medium">Current Backup Status</h4>
        <div className="text-sm text-gray-500">No backup activity yet.</div>
      </div>
    );
  }

  const progress = typeof status.progress === 'number' ? Math.min(100, Math.max(0, status.progress)) : null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Current Backup Status</h4>
        <button onClick={fetchStatus} disabled={loading} className="text-xs text-blue-600 hover:underline">
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="mt-2 text-sm">
        <div>Status: <strong>{status.status || JSON.stringify(status)}</strong></div>
        {progress !== null && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
              <div className="h-2 bg-green-500" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs text-gray-500 mt-1">Progress: {progress}%</div>
          </div>
        )}
        {status.error && <div className="text-red-600 mt-2">Error: {status.error}</div>}
        {lastFetched && <div className="text-xs text-gray-400 mt-2">Last updated: {lastFetched.toLocaleTimeString()}</div>}
      </div>
    </div>
  );
};

export default BackupStatus;
