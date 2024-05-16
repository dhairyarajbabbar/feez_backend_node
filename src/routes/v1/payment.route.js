const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const controller = require('../../controllers/payment.controller');

router.get('/',controller.getAllPayments);
router.get('/details',controller.getPaymentDetails);
router.post('/cash',controller.createCashPaymentByAmount);
router.post('/id',controller.createPaymentForFee);
router.post('/online', controller.createOnlinePayment);
router.put('/:id',controller.updateCashPayment);
router.delete('/:id',controller.deleteCashPayment);


// router.get('/', auth('viewPayments'), controller.getAllPayments);
// router.get('/details', auth('viewPayments'), controller.getAllPayments);
// router.post('/cash', auth('makeCashPayments'), controller.createCashPaymentByAmount);
// router.post('/online',auth('makeOnlinePayment'), controller.createOnlinePayment);
// router.put('/:id', auth('managePayment'), controller.updateCashPayment);
// router.delete('/:id', auth('managePayment'), controller.deleteCashPayment);

// router.get('/:date', controller.getPaymentsForDate);
// router.get('/:id', controller.getPaymentByID);
// router.post('/cash/partial/:id', controller.createPartialPayment);


module.exports = router;
