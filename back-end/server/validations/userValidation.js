const validator = require('validator');

function validateUserData({ username, email, password, role }) {
  if (!username || !email || !password || !role) {
    return 'Missing required fields';
  }
  if (!validator.isEmail(email)) {
    return 'Invalid email format';
  }
  return null; 
}

function validateUpdateUserData({ email }) {
    if (!email) {
      return 'Email is required';
    }
    if (!validator.isEmail(email)) {
      return 'Invalid email format';
    }
    return null;
  }
  
  module.exports = { validateUserData, validateUpdateUserData };
