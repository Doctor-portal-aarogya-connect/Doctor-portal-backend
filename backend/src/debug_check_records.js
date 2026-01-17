require('dotenv').config();
const mongoose = require('mongoose');

// Define Schema locally to avoid import issues
const AttachmentSchema = new mongoose.Schema({
    filename: String,
    gridFsId: mongoose.Schema.Types.ObjectId,
    mimeType: String,
    size: Number,
    kind: String,
}, { _id: false });

const RecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    queryNumber: { type: String, index: true },
    phone: { type: String },
    summary: { type: String },
    details: { type: String },
    attachments: [AttachmentSchema],
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });

const Record = mongoose.model('Record', RecordSchema);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const record = await Record.findOne().sort({ createdAt: -1 });
        console.log('LATEST RECORD:');
        console.log(JSON.stringify(record, null, 2));

        if (record && record.attachments) {
            console.log('ATTACHMENTS:', record.attachments);
        } else {
            console.log('NO ATTACHMENTS FOUND');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.connection.close();
    }
};

connectDB();
