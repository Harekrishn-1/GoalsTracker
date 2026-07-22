const mongoose = require('mongoose');
const { Schema } = mongoose;

const goalSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    category: {
        type: String,
        enum: ['Personal', 'Study', 'Work', 'Health'],
        default: 'Personal'
    },
    startTime: {
        type: String,   // 'HH:MM'
        default: ''
    },
    endTime: {
        type: String,
        default: ''
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    date: {
        type: String,   // 'YYYY-MM-DD'
        required: true
    },
    submitted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

goalSchema.index({ userId: 1, date: 1 });

const Goal = mongoose.model('goal', goalSchema);

module.exports = Goal;
