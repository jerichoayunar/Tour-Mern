import React, { useState } from 'react';
import api from '../../services/api';

const Spinner = ({ className = 'w-4 h-4' }) => (
  <svg className={`${className} animate-spin text-white`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
);

const BackupButton = ({ onStarted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleStart = async () => {
    setError(null);
    setSuccessMsg(null);
    if (!confirm('Start manual backup now? This may use network and CPU resources.')) return;
    setLoading(true);
    try {
      const res = await api.post('/backup/start');
      if (res.status === 501) {
        setError(res.data?.message || 'Manual backup not available on server.');
      } else if (res.data && res.data.job) {
        setSuccessMsg('Backup started');
        onStarted && onStarted(res.data.job);
      } else {
        setSuccessMsg('Backup request sent');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        disabled={loading}
        onClick={handleStart}
        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md"
      >
        {loading ? <Spinner className="w-4 h-4 mr-2" /> : <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        {loading ? 'Backing up...' : 'Backup Now'}
      </button>

      {successMsg && <div className="text-green-600 mt-2">{successMsg}</div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
};

export default BackupButton;
