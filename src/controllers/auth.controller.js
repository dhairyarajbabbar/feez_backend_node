const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const schoolAuthService = require('../services/schoolAuth.service');
const studentAuthService = require('../services/studentAuth.service');
const ApiError = require('../utils/ApiError');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config/config');
const bcrypt = require('bcryptjs');
const School = require('../models/school');
const { tokenTypes } = require('../config/tokens');


const schoolLogin = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const school = await School.findOne({ contact: email });
  if (!school || !(await school.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  const payload = {
    id: school.id,
    type: tokenTypes.ACCESS 
  };
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.accessExpirationMinutes });
  // console.log(accessToken);
  res.cookie('accessToken', accessToken, {
    expires: accessTokenExpires.toDate(),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  res.send({ school });
});



const studentLogin = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const studentTokens = await studentAuthService.loginStudentWithEmailAndPassword(email, password);
  res.send({ studentTokens });
});

const schoolLogout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  await schoolAuthService.logout(refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const studentLogout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  await studentAuthService.logout(refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshSchoolTokens = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const schoolTokens = await schoolAuthService.refreshAuth(refreshToken);
  if (schoolTokens) {
    res.send({ schoolTokens });
  } else {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
});

const refreshStudentTokens = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const studentTokens = await studentAuthService.refreshAuth(refreshToken);
  if (studentTokens) {
    res.send({ studentTokens });
  } else {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  await schoolAuthService.forgotPassword(email);
  await studentAuthService.forgotPassword(email);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetSchoolPassword = catchAsync(async (req, res) => {
  const { token } = req.query;
  const { password } = req.body;
  await schoolAuthService.resetPassword(token, password);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetStudentPassword = catchAsync(async (req, res) => {
  const { token } = req.query;
  const { password } = req.body;
  await studentAuthService.resetPassword(token, password);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifySchoolEmail = catchAsync(async (req, res) => {
  const { token } = req.query;
  await schoolAuthService.verifyEmail(token);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyStudentEmail = catchAsync(async (req, res) => {
  const { token } = req.query;
  await studentAuthService.verifyEmail(token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  schoolLogin,
  studentLogin,
  schoolLogout,
  studentLogout,
  refreshSchoolTokens,
  refreshStudentTokens,
  forgotPassword,
  resetSchoolPassword,
  resetStudentPassword,
  verifySchoolEmail,
  verifyStudentEmail,
};



// const httpStatus = require('http-status');
// const catchAsync = require('../utils/catchAsync');
// const { authService, userService, tokenService, emailService } = require('../services');

// const register = catchAsync(async (req, res) => {
//   const user = await userService.createUser(req.body);
//   const tokens = await tokenService.generateAuthTokens(user);
//   res.status(httpStatus.CREATED).send({ user, tokens });
// });

// const login = catchAsync(async (req, res) => {
//   const { email, password } = req.body;
//   const user = await authService.loginUserWithEmailAndPassword(email, password);
//   const tokens = await tokenService.generateAuthTokens(user);
//   res.send({ user, tokens });
// });

// const logout = catchAsync(async (req, res) => {
//   await authService.logout(req.body.refreshToken);
//   res.status(httpStatus.NO_CONTENT).send();
// });

// const refreshTokens = catchAsync(async (req, res) => {
//   const tokens = await authService.refreshAuth(req.body.refreshToken);
//   res.send({ ...tokens });
// });

// const forgotPassword = catchAsync(async (req, res) => {
//   const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
//   await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
//   res.status(httpStatus.NO_CONTENT).send();
// });

// const resetPassword = catchAsync(async (req, res) => {
//   await authService.resetPassword(req.query.token, req.body.password);
//   res.status(httpStatus.NO_CONTENT).send();
// });

// const sendVerificationEmail = catchAsync(async (req, res) => {
//   const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
//   await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
//   res.status(httpStatus.NO_CONTENT).send();
// });

// const verifyEmail = catchAsync(async (req, res) => {
//   await authService.verifyEmail(req.query.token);
//   res.status(httpStatus.NO_CONTENT).send();
// });

// module.exports = {
//   register,
//   login,
//   logout,
//   refreshTokens,
//   forgotPassword,
//   resetPassword,
//   sendVerificationEmail,
//   verifyEmail,
// };



