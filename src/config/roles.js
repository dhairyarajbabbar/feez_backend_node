const allRoles = {
  student: ['viewStudentSelf', 'manageStudent', 'viewSelfPayments', 'viewFees'],
  school: [
    'getOwnSchool',
    'updateOwnSchool',

    'viewStudent',
    'viewStudentSelf',
    'manageStudents',
    'deleteStudents',
    'createStudent',

    'viewFees',
    'createFee',
    'manageFee',
    
    'makeCashPayments',
    'viewPayments',
    'managePayments',
  ],
  paymentApp: ['makeOnlinePayment'],
  admin: [
    'getUsers',
    'manageUsers',
    'getStudents',
    'manageStudents',
    'getSchools',
    'manageSchools',
    'getFees',
    'manageFees',
    'getPayments',
    'managePayments',
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
