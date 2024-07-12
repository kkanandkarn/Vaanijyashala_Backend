const { register, login } = require("./auth");
const dropdownCode = require("./dropdown-code");
const { generateOtp, verifyOtp } = require("./otp");

module.exports = {
  generateOtp,
  verifyOtp,
  dropdownCode,
  register,
  login,
};
