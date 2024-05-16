const bcrypt = require('bcryptjs');
const Student = require('../models/student');
const School = require('../models/school');
const Fee = require('../models/fee');
const { createFee } = require('./fee.controller');

async function markPastDueFees(studentID) {
  try {
    const student = await Student.findById(studentID);
    if (!student) {
      throw new Error('Student not found');
    }
    const now = new Date();
    let updateRequired = false;
    for (const sessionYear in student.yearToFee) {
      for (const fee of student.yearToFee[sessionYear]) {
        if (fee.generateDate < now && fee.status !== 'paid') {
          fee.status = 'unpaid';
          updateRequired = true;
        }
      }
    }
    if (updateRequired) {
      await Student.findByIdAndUpdate(studentID, { feeStatuses: student.feeStatuses });
    }
  } catch (error) {
    throw new Error('Failed to mark past due fees');
  }
}

async function getAllStudents(req, res) {
  try {
    // const schoolId = req.body.schoolID;
    const {schoolId} =req.body;
    const students = await Student.find({ schoolId:schoolId });
    // for (const student of students) {
    //   await markPastDueFees(student._id);
    // }
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ msg: 'Failed to retrieve students', error:error });
  }
}

async function getStudentByID(req, res) {
  try {
    const studentID = req.params.id;
    await markPastDueFees(studentID);
    const student = await Student.findById(studentID);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve student' });
  }
}

async function createStudent(req, res) {
  try {
    const {schoolId}=req.body;
    const { name, rollNumber, password, contact, class: className, feeType, feeAmount,} = req.body;
    const enrollmentDate = req.body.enrollmentDate || new Date();
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(password, 8);
    const student = new Student({
      name,
      rollNumber,
      password: hashedPassword,
      contact,
      class: className,
      schoolId,
      enrollmentDate,
    });
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }
    const savedStudent = await student.save();

    school.studentIds.push(savedStudent._id);
    await school.save();

    // req.body.studentId = savedStudent._id;
    // try {
    //   await createFee(req, res);
    // } catch (error) {
    //   console.error('Failed to create fee for student:', error);
    //   return res.status(500).json({ error: 'Failed to create fee for student', id: savedStudent._id });
    // }
    res.status(201).json({ id: savedStudent._id });
  } catch (error) {
    console.error('Failed to create student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
}

const updateStudent = async (req, res) => {
  try {
    const studentID = req.params.id;
    const updates = req.body;
    const options = { new: true };

    const updatedStudent = await Student.findByIdAndUpdate(studentID, updates, options);

    if (!updatedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.status(200).json(updatedStudent);
  } catch (error) {
    console.error('Failed to update student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
};

async function deleteStudent(req, res) {
  try {
    const { schoolId } = req.body;
    const studentID = req.params.id;
    const student = await Student.findById(studentID);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    if (student.schoolId.toString() !== schoolId.toString()) {
      return res.status(403).json({ error: 'Forbidden. Student does not belong to this school.', error });
    }
    await Student.findByIdAndDelete(studentID);
    res.status(200).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete student', error });
  }
}


async function listStudentsWithDueFee(req, res) {
  try {
    const { schoolId } = req.body;
    // const schoolID ="662275f4d7839e51bc7f5465";
    const students = await Student.find({ schoolId:schoolId });
    const studentsWithDueFee = await Promise.all(students.map(async (student) => {
      const totalDueFee = await calculateTotalDueFee(student._id);
      const { rollNumber, name, class: className, contact, _id } = student;
      return {
        _id,
        rollNumber,
        name,
        class: className,
        contact,
        dueFee: totalDueFee,
      };
    }));
    res.status(200).json(studentsWithDueFee);
  } catch (error) {
    console.error('Failed to list students with due fee:', error);
    res.status(500).json({ error: 'Failed to list students with due fee' });
  }
}
async function calculateTotalDueFee(studentId) {
  const unpaidFees = await Fee.find({ studentId, status: { $in: ['unpaid', 'upcoming'] } });
  const totalDueFee = unpaidFees.reduce((total, fee) => total + fee.amount, 0);
  return totalDueFee;
}

async function listStudentsWithIdOnly(req, res) {
  try {
    const {schoolId} = req.body;
    const students = await Student.find({ schoolId: schoolId }).select('_id name rollNumber'); 
    res.status(200).json(students);
  } catch (error) {
    console.error('Failed to retrieve student details:', error);
    res.status(500).json({ error: 'Failed to retrieve student details' });
  }
}


module.exports = {
  getAllStudents,
  getStudentByID,
  createStudent,
  updateStudent,
  deleteStudent,
  listStudentsWithDueFee,
  listStudentsWithIdOnly,
};
