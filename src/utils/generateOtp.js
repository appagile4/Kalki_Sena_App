const crypto = require("crypto");

/**
 * Generates a secure 5-digit numeric OTP string (10000 - 99999)
 * Matching the 5-box OTP entry fields in the Kalki Sena mobile app
 */
const generateOtp = () => {
  return crypto.randomInt(10000, 100000).toString();
};

module.exports = generateOtp;
