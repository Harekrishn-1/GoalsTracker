const mongoose = require('mongoose');
const { Schema } = mongoose;

const targetGoalSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 120
    },
    category: {
        type: String,
        enum: ['Personal', 'Study', 'Work', 'Health'],
        default: 'Personal'
    },
    deadline: {
        type: String, // 'YYYY-MM-DD'
        required: true
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
    },
    remindersEnabled: {
        type: Boolean,
        default: true
    },
    remindersSent: {
        twoDay: { type: Boolean, default: false },
        oneDay: { type: Boolean, default: false },
        zeroDay: { type: Boolean, default: false }
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

targetGoalSchema.index({ userId: 1, deadline: 1 });

const TargetGoal = mongoose.model('targetGoal', targetGoalSchema);

module.exports = TargetGoal;
