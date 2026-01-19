require('dotenv').config();
const mongoose = require('mongoose');
const Record = require('./models/Record');
const Appointment = require('./models/Appointment');

async function testFiltering() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Test Record Filtering
        console.log('\n--- TESTING RECORD FILTERING (status=pending,processing) ---');
        const activeRecords = await Record.find({ status: { $in: ['pending', 'processing'] } });
        const completedRecords = await Record.find({ status: 'resolved' });

        console.log(`Active Records (Pending/Processing): ${activeRecords.length}`);
        console.log(`Resolved Records (History): ${completedRecords.length}`);

        if (completedRecords.length > 0) {
            console.log('Sample Resolved Record:', JSON.stringify(completedRecords[0], null, 2));
        }

        // Test Appointment Filtering
        console.log('\n--- TESTING APPOINTMENT FILTERING (status=pending,confirmed) ---');
        const activeAppts = await Appointment.find({ status: { $in: ['pending', 'confirmed'] } });
        const completedAppts = await Appointment.find({ status: 'completed' });

        console.log(`Active Appointments: ${activeAppts.length}`);
        console.log(`Completed Appointments: ${completedAppts.length}`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

testFiltering();
