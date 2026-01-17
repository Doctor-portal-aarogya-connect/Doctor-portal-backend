const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
    filename: String,
    gridFsId: String, // Cloudinary URL
    mimeType: String,
    size: Number,
    kind: String,
}, { _id: false });

const RecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    queryNumber: { type: String, index: true },
    phone: { type: String },
    summary: { type: String },
    details: { type: String },
    attachments: [AttachmentSchema],
    doctorResponse: { type: String }, // Digital prescription / notes
    doctorName: { type: String },
    doctorDetails: { type: String },
    status: { type: String, enum: ['pending', 'processing', 'resolved', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Record', RecordSchema);
