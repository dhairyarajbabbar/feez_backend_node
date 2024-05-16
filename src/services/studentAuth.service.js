const httpStatus = require('http-status');
const tokenService = require('./token.service');
const Student = require('../models/student');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');

const loginStudentWithEmailAndPassword = async (email, password) => {
  const student = await Student.findOne({ email });
  if (!student || !(await student.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return student;
};

const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const student = await Student.findById(refreshTokenDoc.student);
    if (!student) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(student);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await Token.findOne({ token: verifyEmailToken, type: tokenTypes.VERIFY_EMAIL });
    if (!verifyEmailTokenDoc) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Token not found');
    }
    const student = await Student.findById(verifyEmailTokenDoc.student);
    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Student not found');
    }
    await Token.deleteOne({ _id: verifyEmailTokenDoc._id });
    await Student.updateOne({ _id: student._id }, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

module.exports = {
  loginStudentWithEmailAndPassword,
  logout,
  refreshAuth,
  verifyEmail,
};
