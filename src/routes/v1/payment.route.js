const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const controller = require('../../controllers/payment.controller');

router.get('/',auth('viewPayments'), controller.getAllPayments);
router.get('/details', auth('viewPayments'), controller.getPaymentDetails);

router.post('/', auth('makeCashPayments'), controller.createPaymentForFee);
router.post('/online', auth('makeOnlinePayment'), controller.createOnlinePayment);
router.post('/amount', auth('makeCashPayments'), controller.createCashPaymentByAmount);

router.put('/:id', auth('managePayment'), controller.updateCashPayment);
router.delete('/:id', auth('managePayment'), controller.deleteCashPayment);


// router.post('/cash',controller.createCashPaymentByAmount);
// router.post('/online',controller.createOnlinePayment);

// router.get('/:date', controller.getPaymentsForDate);
// router.get('/:id', controller.getPaymentByID);
// router.post('/cash/partial/:id', controller.createPartialPayment);


module.exports = router;
