const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const controller = require('../../controllers/student.controller');

router.get('/', auth('viewStudent'), controller.getAllStudents);
router.get('/withdue', auth('viewStudent'), controller.listStudentsWithDueFee);
router.get('/id', auth('viewStudent'), controller.listStudentsWithIdOnly);
router.get('/:id', auth('viewStudentSelf'), controller.getStudentByID);
router.post('/', auth('createStudent'), controller.createStudent);
router.put('/:id', auth('manageStudent'), controller.updateStudent);
router.delete('/:id', auth('deleteStudents'), controller.deleteStudent);

module.exports = router;
