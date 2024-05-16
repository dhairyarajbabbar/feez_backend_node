const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const controller = require('../../controllers/fee.controller');

router.get('/', auth('viewFees'), controller.getAllFeesForSchool);
router.get('/detail', auth('viewFees'), controller.listStudentsWithFeeDetails);
router.get('/student', auth('viewFees'), controller.getAllFeesForStudent);
router.post('/', auth('createFee'), controller.createFee);
router.put('/:id', controller.updateFee);
router.delete('/:id', controller.deleteFee);


// router.get('/', auth('viewFees'), controller.getAllFeesForSchool);
// router.get('/student', auth('viewFees'), controller.getAllFeesForStudent);
// router.post('/', auth('createFee'), controller.createFee);
// router.put('/:id', auth('manageFee'), controller.updateFee);
// router.delete('/:id', auth('manageFee'), controller.deleteFee);


module.exports = router;
