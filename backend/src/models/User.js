const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String },
    mobile: { type: String },
    email: { type: String, lowercase: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
