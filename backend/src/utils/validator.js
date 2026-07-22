const validator = require('validator');

// Har check ka apna clear message — frontend yahi dikhata hai
const validate = (data) => {
    const { firstName, emailId, password } = data;

    if (!firstName || firstName.trim().length < 2)
        throw new Error('Please enter your first name (at least 2 characters)');

    if (!emailId)
        throw new Error('Email is required');

    if (!validator.isEmail(emailId))
        throw new Error('Please enter a valid email address');

    if (!password)
        throw new Error('Password is required');

    if (!validator.isStrongPassword(password))
        throw new Error('Password needs 8+ characters with an uppercase letter, a number and a symbol');
};

module.exports = validate;
