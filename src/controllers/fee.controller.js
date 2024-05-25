const Fee = require('../models/fee');
const Student = require('../models/student');

async function getAllFeesForStudent(req, res) {
  try {
    // console.log(req.body)
    const { studentId } = req.body;
    const fees = await Fee.find({ student: studentId }).populate('student');

    res.status(200).json(fees);
  } catch (error) {
    console.error('Failed to retrieve fees for student:', error);
    res.status(500).json({ error: 'Failed to retrieve fees for student' });
  }
}

async function getAllFeesForSchool(req, res) {
  try {
    const { schoolId } = req.body;
    const fees = await Fee.find({ schoolId: schoolId });
    res.status(200).json(fees);
  } catch (error) {
    console.error('Failed to retrieve fees:', error);
    res.status(500).json({ error: 'Failed to retrieve fees' });
  }
}

async function createFee(req, res) {
  try {
    const { schoolId } = req.body;
    const { studentId, feeType, amount, generateDate, enrollmentDate } = req.body;
    const dateToUse = generateDate || enrollmentDate;
        console.log(req.body);
    if (!['One Time', 'Monthly', 'Quarterly'].includes(feeType)) {
      console.log('invalid fee type');
      return res.status(400).json({ error: 'Invalid fee type' });
    }
    const student = await Student.findById(studentId);
    if (!student) {
      console.log('student not found');
      return res.status(404).json({ error: 'Student not found' });
    }
    const currentYear = getCurrentSessionYear();
    if (!student.yearToFee) {
      student.yearToFee = new Map();
    }
    if (!student.yearToFee.get(currentYear)) {
      student.yearToFee.set(currentYear, []);
    }
    async function createAndSaveFee(date) {
      const fee = new Fee({
        schoolId,
        studentId,
        feeType,
        amount,
        generateDate: date,
        status: 'upcoming',
        paidAmount: 0,
      });
      const savedFee = await fee.save();
      student.yearToFee.get(currentYear).push(savedFee._id);
      return savedFee;
    }
    let savedFee;
    if (feeType === 'One Time') {
      savedFee = await createAndSaveFee(new Date(dateToUse));
    } else if (feeType === 'Monthly') {
      const months = getCurrentSessionMonths(dateToUse);
      for (let month of months) {
        savedFee = await createAndSaveFee(month);
      }
    } else if (feeType === 'Quarterly') {
      const quarters = getCurrentSessionQuarters(dateToUse);
      for (let quarter of quarters) {
        savedFee = await createAndSaveFee(quarter);
      }
    }
    await student.save();
    res.status(201).json({ id: savedFee?._id });
  } catch (error) {
    console.error('Failed to create new fee:', error);
    res.status(500).json({ error: 'Failed to create new fee' });
  }
}
function getCurrentSessionYear() {
  const today = new Date();
  const year = today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear();
  return year.toString();
}
function getCurrentSessionMonths(dateToUse) {
  const start = new Date(dateToUse);
  const months = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(start.getFullYear(), start.getMonth() + i, start.getDate());
    months.push(date);
  }
  return months;
}
function getCurrentSessionQuarters(generateDate) {
  const start = new Date(generateDate);
  const quarters = [];
  const initialYear = start.getFullYear();
  for (let i = 0; i < 4; i++) {
    let month = start.getMonth() + i * 3;
    let year = start.getFullYear();
    if (month > 11) {
      month = month % 12;
      year += Math.floor((start.getMonth() + i * 3) / 12);
    }
    if (year > initialYear + 1 || (year === initialYear + 1 && month > 2)) {
      break;
    }
    const quarterDate = new Date(year, month, start.getDate());
    quarters.push(quarterDate);
  }
  return quarters;
}

async function getFeeById(req, res) {
  try {
    const { id } = req.body;
    const fee = await Fee.findById(id);
    if (!fee) {
      return res.status(404).json({ error: 'Fee not found' });
    }
    res.status(200).json(fee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve fee' });
  }
}

async function updateFee(req, res) {
  try {
    const { id } = req.params;
    const updatedFeeData = req.body;
    const updatedFee = await Fee.findByIdAndUpdate(id, updatedFeeData, { new: true });
    if (!updatedFee) {
      return res.status(404).json({ error: 'Fee not found' });
    }
    res.status(200).json(updatedFee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update fee' });
  }
}

async function deleteFee(req, res) {
  try {
    const { id } = req.params;
    const deletedFee = await Fee.findByIdAndDelete(id);
    if (!deletedFee) {
      return res.status(404).json({ error: 'Fee not found' });
    }
    res.status(200).json({ message: 'Fee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete fee' });
  }
}

async function listStudentsWithFeeDetails(req, res) {
  try {
    const { schoolId } = req.body;
    const students = await Student.find({ schoolId }).select('-password');
    const studentsWithDetails = [];
    for (const student of students) {
      const feeDetails = await Fee.find({ studentId: student._id });
      const dueFee = calculateTotalDueFee(feeDetails);
      if (dueFee > 0) {
        const formattedFeeDetails = formatFeeDetails(feeDetails);
        studentsWithDetails.push({
          rollNumber: student.rollNumber,
          name: student.name,
          enrollmentDate: student.enrollmentDate,
          dueFee: dueFee,
          feeDetails: formattedFeeDetails,
          id: student._id,
        });
      }
    }
    res.status(200).json(studentsWithDetails);
  } catch (error) {
    console.error('Failed to retrieve student details:', error);
    res.status(500).json({ error: 'Failed to retrieve student details' });
  }
}
function calculateTotalDueFee(feeDetails) {
  let totalDueFee = 0;
  for (const fee of feeDetails) {
    if (fee.status === 'upcoming' || fee.status === 'unpaid') {
      totalDueFee += fee.amount;
    }
  }
  return totalDueFee;
}
function formatFeeDetails(feeDetails) {
  const formattedDetails = [];
  for (const fee of feeDetails) {
    const paymentId = fee.payments.length > 0 ? fee.payments[0] : '0000';
    formattedDetails.push({
      feeId: fee._id, // Include fee ID
      paymentId: paymentId,
      feeType: fee.feeType,
      amount: fee.amount,
      status: fee.status,
      dueDate: fee.generateDate,
    });
  }
  return formattedDetails;
}

module.exports = {
  getAllFeesForStudent,
  getAllFeesForSchool,
  createFee,
  getFeeById,
  updateFee,
  deleteFee,
  listStudentsWithFeeDetails,
};
