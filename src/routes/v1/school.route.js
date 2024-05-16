const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const controller = require('../../controllers/school.controller');

router.get('/', controller.getAllSchools);
router.get('/:id', controller.getSchoolByID);
router.post('/', controller.createSchool);
router.put('/:id', controller.updateSchool);
router.delete('/', controller.deleteSchool);


// router.get('/', auth('getOwnSchool'), controller.getAllSchools);
// router.get('/:id', auth('getOwnSchool'), controller.getSchoolByID);
// // router.post('/', auth('manageOwnSchool'), controller.createSchool);
// router.put('/:id', auth('updateOwnSchool'), controller.updateSchool);
// router.delete('/:id', auth('manageOwnSchool'), controller.deleteSchool);

module.exports = router;



