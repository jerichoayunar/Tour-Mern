import React from 'react';
import BackupButton from './BackupButton';
import BackupStatus from './BackupStatus';
import BackupHistory from './BackupHistory';

const BackupDashboard = () => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Backups</h2>
          <p className="text-sm text-gray-500">Create and manage database backups.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white shadow-sm rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Actions</h3>
            <div className="mb-4">
              <BackupButton />
            </div>
            <div>
              <BackupStatus />
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white shadow-sm rounded-lg p-4">
            <BackupHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupDashboard;
