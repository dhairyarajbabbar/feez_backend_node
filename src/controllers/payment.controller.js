const { Payment } = require('../models/payment');
const { Student } = require('../models/student');

async function getAllPayments(req, res) {
  try {
    const payments = await paymentCollection.find({}).toArray();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve payments' });
  }
}

async function getPaymentById(req, res) {
  try {
    const { id } = req.body;
    const payment = await paymentCollection.findOne({ _id: ObjectId(id) });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve payment' });
  }
}

async function createPaymentForFee(req, res) {
  try {
    const { feeId, schoolId } = req.body;
    const payment = new Payment({
      studentId: req.body.studentId, 
      schoolId,
      amount: req.body.amount, 
      method: 'Cash', 
      feeIds: [feeId] 
    });
    const savedPayment = await payment.save();
    await Fee.findByIdAndUpdate(
      feeId,
      { $push: { payments: savedPayment._id }, $set: { status: 'paid' } },
      { new: true }
    );
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Failed to create payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
}

module.exports = createPaymentForFee;


async function createCashPaymentByAmount(req, res) {
  try {
    const { student_id, school_id, amount } = req.body;
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }
    const student = await Student.findById(student_id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const currentYear = new Date().getFullYear().toString();
    const fees = student.feeStatuses[currentYear];
    if (!fees || !fees.length) {
      return res.status(404).json({ error: 'No fees found for the current year' });
    }

    // Your payment logic here

    const payment = new Payment({
      studentID: student_id,
      schoolID: school_id,
      amount: amount,
      paymentDate: new Date(),
      method: 'cash',
    });

    const savedPayment = await payment.save();
    res.status(200).json(savedPayment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment' });
  }
}

async function createOnlinePayment(req, res) {

}

async function updateCashPayment(req, res) {
  try {
    const { id } = req.params;
    const updatedPaymentData = req.body;

    const updatedPayment = await paymentCollection.findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: updatedPaymentData },
      { returnOriginal: false }
    );

    if (!updatedPayment.value) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.status(200).json(updatedPayment.value);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment' });
  }
}

async function deleteCashPayment(req, res) {
  try {
    const { id } = req.params;

    const deletedPayment = await paymentCollection.findOneAndDelete({ _id: ObjectId(id) });

    if (!deletedPayment.value) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.status(200).json(deletedPayment.value);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete payment' });
  }
}

function getPaymentForMonth(feeType, generateDate) {
  if (feeType === 'monthly') {
    return generateDate.toLocaleString('default', { month: 'long' });
  } else {
    return '';
  }
}
async function getPaymentDetails(req, res) {
  try {
    // const { schoolId } = req.body;
    const schoolId ="662275f4d7839e51bc7f5465";
    const payments = await Payment.find({ schoolId }).populate('studentId');

    const formattedPayments = payments.map(payment => {
      const paymentForMonth = getPaymentForMonth(payment.feeType, payment.studentId.yearToFee.get(payment.generateDate.getFullYear()));

      return {
        rollNumber: payment.studentId.rollNumber,
        name: payment.studentId.name,
        paymentDate: payment.paymentDate,
        paymentForMonth,
        method: payment.method,
        paymentAmount: payment.amount,
      };
    });

    res.status(200).json(formattedPayments);
  } catch (error) {
    console.error('Failed to retrieve payment details:', error);
    res.status(500).json({ error: 'Failed to retrieve payment details' });
  }
}

module.exports = {
  getAllPayments,
  getPaymentById,
  createPaymentForFee,
  createCashPaymentByAmount,
  updateCashPayment,
  deleteCashPayment,
  createOnlinePayment,
  getPaymentDetails,
};
