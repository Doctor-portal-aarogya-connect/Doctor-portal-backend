require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Doctor = require('./models/Doctor');

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Check if test doctor exists
        const existing = await Doctor.findOne({ username: 'testdoctor' });
        if (existing) {
            console.log('Test doctor already exists');
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash('password123', 10);

        await Doctor.create({
            username: 'testdoctor',
            passwordHash,
            fullName: 'Test Doctor',
            mobile: '1234567890',
            email: 'test@doctor.com'
        });

        console.log('Test doctor created:');
        console.log('Username: testdoctor');
        console.log('Password: password123');

        process.exit(0);
    })
    .catch((err) => {
        console.error('Seed error', err);
        process.exit(1);
    });
