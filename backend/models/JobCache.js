const mongoose = require('mongoose');

const JobCacheSchema = new mongoose.Schema({
  queryKey: { type: String, required: true, unique: true }, // e.g. "react-remote"
  jobs: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // TTL 1 hour (3600 seconds)
});

module.exports = mongoose.model('JobCache', JobCacheSchema);
