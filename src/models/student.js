const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
    },
    class: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },
    contact: {
      type: String,
      required: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    yearToFee: {
      type: Map,
      of: [mongoose.Schema.Types.Mixed],
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.pre('save', async function (next) {
  const student = this;
  if (student.isModified('password')) {
    student.password = await bcrypt.hash(student.password, 8);
  }
  next();
});

studentSchema.methods.isPasswordMatch = async function (password) {
  const student = this;
  return bcrypt.compare(password, student.password);
};

const Student = mongoose.model('student', studentSchema);

module.exports = Student;
