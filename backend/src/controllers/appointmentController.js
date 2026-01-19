const Appointment = require('../models/Appointment');

async function getAppointments(req, res) {
    try {
        const { userId, status, excludeStatus } = req.query;
        console.log('DEBUG: getAppointments query:', req.query); // Added Log

        const query = {};
        if (userId) query.userId = userId;

        if (status) {
            const statusList = status.split(',');
            query.status = { $in: statusList };
        } else if (excludeStatus) {
            const excludeList = excludeStatus.split(',');
            query.status = { $nin: excludeList };
        }

        // Fetch all appointments, sorted by date (newest first)
        const appointments = await Appointment.find(query)
            .sort({ createdAt: -1 })
            .populate('userId', 'fullName mobile email age gender'); // Populate patient details

        return res.json({ ok: true, appointments });
    } catch (err) {
        console.error('getAppointments error', err);
        return res.status(500).json({ ok: false, error: 'server error' });
    }
}

async function updateStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ ok: false, error: 'invalid status' });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!appointment) return res.status(404).json({ ok: false, error: 'appointment not found' });

        return res.json({ ok: true, appointment });
    } catch (err) {
        console.error('updateAppointmentStatus error', err);
        return res.status(500).json({ ok: false, error: 'server error' });
    }
}

module.exports = { getAppointments, updateStatus };
