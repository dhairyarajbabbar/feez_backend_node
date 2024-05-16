const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const schoolSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    studentIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }]
}, {
    timestamps: true
});

/**
 * Check if password matches the school's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
schoolSchema.methods.isPasswordMatch = async function (password) {
    const school = this;
    return bcrypt.compare(password, school.password);
};

/**
 * Check if email is taken
 * @param {string} email - The school's email
 * @param {ObjectId} [excludeSchoolId] - The id of the school to be excluded
 * @returns {Promise<boolean>}
 */
schoolSchema.statics.isEmailTaken = async function (email, excludeSchoolId) {
    const school = await this.findOne({ email, _id: { $ne: excludeSchoolId } });
    return !!school;
};

const School = mongoose.model('School', schoolSchema);

module.exports = School;
