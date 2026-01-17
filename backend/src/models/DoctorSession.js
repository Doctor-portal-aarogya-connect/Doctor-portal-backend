const mongoose = require('mongoose');

const DoctorSessionSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
});

DoctorSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('DoctorSession', DoctorSessionSchema);
