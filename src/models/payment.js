const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    method: {
        type: String,
        required: true
    },
    feeIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fee'
    }]
});

const Payment = mongoose.model('payment', paymentSchema);

module.exports = Payment;
