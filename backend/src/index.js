require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

// Register models
require('./models/User');
require('./models/Doctor');
require('./models/DoctorSession');
require('./models/Appointment');
require('./models/Record');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Vercel Serverless: Connect to DB if not connected
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
};

// Local Development
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

// Export the app for Vercel, WRAPPED to ensure connection
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
