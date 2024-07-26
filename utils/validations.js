const { otp } = require("../models");
const { OTP_EXPIRE } = require("./constant");

exports.checkRequiredFields = (fields) => {
  try {
    for (const field of fields) {
      const { value, error } = field;
      if (!value) {
        return { error: error };
      } else if (typeof value === "string" && value === "") {
        return { error: error };
      }
    }
    return null;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.validateOtp = async (email) => {
  console.log("email is: ", email);
  const verify = await otp
    .findOne({ email: email, status: "Active" })
    .sort({ createdAt: -1 })
    .limit(1);

  if (verify) {
    if (verify.isUsed) {
      const otpRecord = verify;
      const createdAt = new Date(otpRecord.createdAt);
      const currentTime = new Date();
      const timeDifference = (currentTime - createdAt) / (1000 * 60);

      if (timeDifference > OTP_EXPIRE) {
        return { success: false };
      }

      return { success: true };
    }
    return { success: false };
  }
  return { success: false };
};
