const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, school, info) => {
  if (err || info || !school) {
    // console.log("here is the problem", err, info, school);
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.body.schoolId = school._id;
  // console.log(school);

  if (requiredRights.length) {
    const schoolRole = "school"; 
    const schoolRights = roleRights.get(schoolRole);
    const hasRequiredRights = requiredRights.every((requiredRight) => schoolRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.schoolId !== school.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }
  resolve();
};

const auth = (...requiredRights) => async (req, res, next) => {
  // console.log('Authorization token:', req.headers.authorization);

  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;


