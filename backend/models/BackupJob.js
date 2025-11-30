import mongoose from 'mongoose';

const backupJobSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['manual', 'scheduled'], default: 'manual' },
    status: { type: String, enum: ['pending', 'running', 'completed', 'failed', 'restoring'], default: 'pending' },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    sizeBytes: { type: Number, default: 0 },
    files: [
      {
        name: String,
        path: String,
        size: Number,
      },
    ],
    driveFileId: { type: String },
    driveFolderId: { type: String },
    error: { type: String, default: null },
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    encrypted: { type: Boolean, default: false },
    retentionKept: { type: Number, default: 0 }
    ,
    summaryDriveFileId: { type: String, default: null }
  },
  { timestamps: true }
);

const BackupJob = mongoose.model('BackupJob', backupJobSchema);
export default BackupJob;
