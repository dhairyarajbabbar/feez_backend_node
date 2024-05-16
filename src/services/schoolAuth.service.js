const httpStatus = require('http-status');
const tokenService = require('./token.service');
const School = require('../models/school');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');

const loginSchoolWithEmailAndPassword = async (email, password) => {
  const school = await School.findOne({ contact:email });
  // console.log(school)
  if (!school || !(await school.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return school;
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
    const school = await School.findById(refreshTokenDoc.school);
    if (!school) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(school);
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
    const school = await School.findById(verifyEmailTokenDoc.school);
    if (!school) {
      throw new ApiError(httpStatus.NOT_FOUND, 'School not found');
    }
    await Token.deleteOne({ _id: verifyEmailTokenDoc._id });
    await School.updateOne({ _id: school._id }, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

module.exports = {
  loginSchoolWithEmailAndPassword,
  logout,
  refreshAuth,
  verifyEmail,
};
