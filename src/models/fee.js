const mongoose = require('mongoose');

const feeSchema = mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    feeType: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    generateDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['paid', 'unpaid', 'partially_paid', 'upcoming'],
        default: 'upcoming'
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    payments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    }]
});

const Fee = mongoose.model('Fee', feeSchema);

module.exports = Fee;
