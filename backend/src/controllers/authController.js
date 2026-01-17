const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Doctor = require('../models/Doctor');
const DoctorSession = require('../models/DoctorSession');

const SALT_ROUNDS = 10;

async function register(req, res) {
    try {
        const { username, password, fullName, mobile } = req.body;
        if (!username || !password) {
            return res.status(400).json({ ok: false, error: 'username and password required' });
        }
        const existing = await Doctor.findOne({ username: username.toLowerCase().trim() });
        if (existing) return res.status(409).json({ ok: false, error: 'username taken' });

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const doctor = await Doctor.create({
            username: username.toLowerCase().trim(),
            passwordHash,
            fullName: fullName || '',
            mobile: mobile || '',
        });
        return res.status(201).json({
            ok: true,
            user: { _id: doctor._id, username: doctor.username, fullName: doctor.fullName },
        });
    } catch (err) {
        console.error('register error', err);
        return res.status(500).json({ ok: false, error: 'server error' });
    }
}

async function login(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ ok: false, error: 'username and password required' });
        }
        const doctor = await Doctor.findOne({ username: username.toLowerCase().trim() });
        if (!doctor) return res.status(401).json({ ok: false, error: 'User not found' });

        const match = await bcrypt.compare(password, doctor.passwordHash);
        if (!match) return res.status(401).json({ ok: false, error: 'Incorrect password' });

        const token = uuidv4();
        const ttlHours = Number(process.env.SESSION_TTL_HOURS || 48);
        const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000);

        await DoctorSession.create({ token, doctorId: doctor._id, expiresAt });

        return res.json({
            ok: true,
            token,
            user: { _id: doctor._id, username: doctor.username, fullName: doctor.fullName },
        });
    } catch (err) {
        console.error('login error', err);
        return res.status(500).json({ ok: false, error: 'server error' });
    }
}

async function logout(req, res) {
    try {
        // If route uses sessionAuth middleware, req.session exists
        if (req.session && req.session._id) {
            await DoctorSession.deleteOne({ _id: req.session._id });
            return res.json({ ok: true });
        }

        // Fallback: allow deleting by token header
        const token = req.header('x-session-token');
        if (!token) return res.status(400).json({ ok: false, error: 'missing session token' });

        await DoctorSession.deleteOne({ token });
        return res.json({ ok: true });
    } catch (err) {
        console.error('logout error', err);
        return res.status(500).json({ ok: false, error: 'server error' });
    }
}

async function getMe(req, res) {
    try {
        // req.user is set by the sessionAuth middleware
        if (!req.user) {
            return res.status(401).json({ ok: false, error: 'not authenticated' });
        }
        return res.json({
            ok: true,
            user: {
                _id: req.user._id,
                username: req.user.username,
                fullName: req.user.fullName,
                mobile: req.user.mobile,
                email: req.user.email
            },
        });
    } catch (err) {
        console.error('getMe error', err);
        return res.status(500).json({ ok: false, error: 'server error' });
    }
}

module.exports = { register, login, logout, getMe };
