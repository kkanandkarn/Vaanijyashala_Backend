const { registerController, loginController } = require("./auth");
const { dropdwonCodeController } = require("./dropdwon-code");
const { generateOtpController, verifyOtpController } = require("./otp");

module.exports = {
  generateOtpController,
  verifyOtpController,
  dropdwonCodeController,
  registerController,
  loginController,
};
