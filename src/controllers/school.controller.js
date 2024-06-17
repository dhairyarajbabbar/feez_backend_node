const School = require('../models/school');
const bcrypt = require('bcryptjs');

async function getAllSchools(req, res) {
  try {
    const schools = await School.find({});
    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve schools' });
  }
}

async function getSchoolByID(req, res) {
  try {
    const schoolID = req.body.id;
    const school = await School.findById(schoolID);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }
    res.status(200).json(school);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve school' });
  }
}

async function createSchool(req, res) {
  try {
    const { name, location, contact, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    console.log(hashedPassword)
    const school = new School({ name, location, contact, email, password: hashedPassword });
    const savedSchool = await school.save();
    res.status(201).json({ id: savedSchool._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create school', error });
  }
}

async function updateSchool(req, res) {
  try {
    const schoolID = req.params.id;
    const updatedSchool = req.body;
    const result = await School.findByIdAndUpdate(schoolID, updatedSchool);
    if (!result) {
      return res.status(404).json({ error: 'School not found' });
    }
    res.status(200).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to update school' });
  }
}

async function deleteSchool(req, res) {
  try {
    const schoolID = req.body.id;
    const result = await School.findByIdAndDelete(schoolID);
    if (!result) {
      return res.status(404).json({ error: 'School not found' });
    }
    res.status(200).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete school' });
  }
}

module.exports = {
  getAllSchools,
  getSchoolByID,
  createSchool,
  updateSchool,
  deleteSchool
};
