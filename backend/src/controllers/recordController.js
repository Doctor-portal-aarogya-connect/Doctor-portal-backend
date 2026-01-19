const Record = require('../models/Record');
const mongoose = require('mongoose');

async function getRecords(req, res) {
    try {
        const { userId, status, excludeStatus } = req.query;

        // Build query object
        const query = {};
        if (userId) query.userId = userId;

        if (status) {
            // Support comma-separated status
            const statusList = status.split(',');
            query.status = { $in: statusList };
        } else if (excludeStatus) {
            const excludeList = excludeStatus.split(',');
            query.status = { $nin: excludeList };
        }

        const records = await Record.find(query)
            .sort({ createdAt: -1 })
            .populate('userId', 'fullName mobile email age gender'); // Added age/gender if available using reusable user schema

        // Records now have direct URLs in gridFsId
        const recordsWithUrls = records.map(r => {
            const record = r.toObject();
            if (record.attachments && record.attachments.length > 0) {
                record.attachments = record.attachments.map(att => ({
                    ...att,
                    url: att.gridFsId // Direct Cloudinary URL
                }));
            }
            return record;
        });

        return res.json({ ok: true, records: recordsWithUrls });
    } catch (err) {
        console.error('getRecords error', err);
        return res.status(500).json({ ok: false, error: 'server error' });
    }
}

async function updateStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, doctorResponse, doctorName, doctorDetails } = req.body;

        if (status && !['pending', 'processing', 'resolved', 'completed', 'failed'].includes(status)) {
            return res.status(400).json({ ok: false, error: 'invalid status' });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (doctorResponse) updateData.doctorResponse = doctorResponse;
        if (doctorName) updateData.doctorName = doctorName;
        if (doctorDetails) updateData.doctorDetails = doctorDetails;

        const record = await Record.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!record) return res.status(404).json({ ok: false, error: 'record not found' });

        return res.json({ ok: true, record });
    } catch (err) {
        console.error('updateRecordStatus error', err);
        return res.status(500).json({ ok: false, error: 'server error' });
    }
}

module.exports = { getRecords, updateStatus };
