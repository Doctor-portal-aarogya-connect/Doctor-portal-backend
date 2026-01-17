const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (will be imported later)
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const recordRoutes = require('./routes/recordRoutes');

app.use('/auth', authRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/records', recordRoutes);

app.get('/', (req, res) => {
    res.send('Doctor App Backend is running');
});

module.exports = app;
