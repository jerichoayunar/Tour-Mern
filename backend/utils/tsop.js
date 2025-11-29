class TSOPAbortError extends Error {
  constructor(message, code = 'TSOP_ABORT') {
    super(message);
    this.name = 'TSOPAbortError';
    this.code = code;
  }
}

let _localCounter = 0;
export function getTs() {
  // Return a monotonic, high-resolution timestamp in microseconds.
  // Uses Date.now() (ms) * 1000 + sub-ms part from process.hrtime to get microsecond precision.
  // Result is returned as a Number (safe for current epoch values).
  const nowMicro = Number(BigInt(Date.now()) * 1000n + (process.hrtime.bigint() % 1000n));
  _localCounter = Math.max(_localCounter + 1, nowMicro);
  return _localCounter;
}

export async function readWithTS(Model, query, txTs) {
  const doc = await Model.findOne(query).exec();
  if (!doc) return null;
  const writeTs = doc.write_ts || 0;
  if (writeTs > txTs) {
    throw new TSOPAbortError('Read conflict: object was written after transaction timestamp', 'TSOP_ABORT_READ');
  }
  await Model.updateOne(query, { $max: { read_ts: txTs } }).exec();
  return doc;
}

export async function writeWithTS(Model, query, update, txTs, opts = { new: true }) {
  const cond = {
    ...query,
    $expr: {
      $and: [
        { $lte: [{ $ifNull: ['$read_ts', 0] }, txTs] },
        { $lte: [{ $ifNull: ['$write_ts', 0] }, txTs] }
      ]
    }
  };

  const mergedUpdate = {
    ...update,
    $set: {
      ...(update.$set || {}),
      write_ts: txTs
    }
  };

  const res = await Model.findOneAndUpdate(cond, mergedUpdate, { ...opts }).exec();
  if (!res) {
    throw new TSOPAbortError('Write conflict: read_ts or write_ts conflict with transaction timestamp', 'TSOP_ABORT_WRITE');
  }
  return res;
}

export default { getTs, readWithTS, writeWithTS, TSOPAbortError };
