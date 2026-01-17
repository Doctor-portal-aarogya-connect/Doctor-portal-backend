const DoctorSession = require('../models/DoctorSession');
const Doctor = require('../models/Doctor');

async function sessionAuth(req, res, next) {
    try {
        const token = req.header('x-session-token');
        if (!token) {
            return res.status(401).json({ ok: false, error: 'missing session token' });
        }

        const session = await DoctorSession.findOne({ token });
        if (!session) {
            return res.status(401).json({ ok: false, error: 'invalid session' });
        }

        if (session.expiresAt < new Date()) {
            return res.status(401).json({ ok: false, error: 'session expired' });
        }

        const doctor = await Doctor.findById(session.doctorId);
        if (!doctor) {
            return res.status(401).json({ ok: false, error: 'user not found' });
        }

        // Attach to request
        req.session = session;
        req.doctor = doctor;
        next();
    } catch (err) {
        console.error('sessionAuth error', err);
        return res.status(500).json({ ok: false, error: 'server error' });
    }
}

module.exports = sessionAuth;
