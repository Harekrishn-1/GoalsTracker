const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 20
    },
    lastName: {
        type: String,
        minLength: 2,
        maxLength: 20
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        immutable: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // Admin stats ke liye — user ne aakhri baar kab kuch kiya
    lastActiveAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const User = mongoose.model('user', userSchema);

module.exports = User;
