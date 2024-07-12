const { ErrorHandler } = require("../../helper");
const {
  SERVER_ERROR,
  BAD_GATEWAY,
  NOT_FOUND,
  CONFLICT,
} = require("../../helper/status-codes");
const { userCredentials, session, otp, otpCount } = require("../../models");
const {
  SERVER_ERROR_MESSAGE,
  RESEND_OTP_COUNT,
} = require("../../utils/constant");
const sendHtml = require("../../utils/mail");
const { checkRequiredFields } = require("../../utils/validations");
const path = require("path");
const ejs = require("ejs");
const moment = require("moment");

const generateOtp = async (req) => {
  try {
    const { name, email, method } = req.body;
    let otpAttempt = 0;
    const fieldsToCheck = [
      { value: name, error: "Name is required" },
      { value: email, error: "Email is required." },
      { value: method, error: "Method is required" },
    ];
    const validationError = checkRequiredFields(fieldsToCheck);
    if (validationError) {
      throw new ErrorHandler(BAD_GATEWAY, validationError.error);
    }
    const allowedMethod = ["signup", "login", "forgetPassword"];
    if (!allowedMethod.includes(method)) {
      throw new ErrorHandler(
        BAD_GATEWAY,
        "Method must be sigup or login or forgetPassword"
      );
    }
    await CheckSession(method, email);
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const otpStr = randomNum.toString();
    const OTP = parseInt(otpStr, 10);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const checkOtpCount = await otpCount.findOne({
      email: email,
      status: "Active",
      createdAt: { $gte: tenMinutesAgo },
    });

    if (checkOtpCount) {
      otpAttempt = checkOtpCount.otpCount;
      // const createdAt = new Date(checkOtpCount.createdAt);
      // const currentTime = new Date();
      // // const timeDifference = (currentTime - createdAt) / (1000 * 60);

      // // console.log("Time difference: => ", timeDifference);

      console.log("OPT ATTEMPT => ", otpAttempt);
      if (otpAttempt >= RESEND_OTP_COUNT) {
        throw new ErrorHandler(BAD_GATEWAY, "Maximum otp reached");
      }
    }

    const templatePath = path.join(
      __dirname,
      "../../template/password-mail.ejs"
    );

    const data = {
      userName: name,
      otp: OTP,
    };
    const htmlContent = await ejs.renderFile(templatePath, data);
    const subject = "OTP for registration";
    // await sendHtml(email, subject, htmlContent);

    const Otp = new otp({
      email: email,
      otp: OTP,
    });
    await Otp.save();
    otpAttempt = otpAttempt + 1;

    if (!checkOtpCount) {
      const OtpCount = new otpCount({ email: email, otpCount: otpAttempt });
      await OtpCount.save();
    }
    if (checkOtpCount) {
      const filter = { email: email, status: "Active" };
      const update = { $set: { otpCount: otpAttempt } };
      const options = { new: true };

      await otpCount.findOneAndUpdate(filter, update, options);
    }

    return { message: "OTP Sent" };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const verifyOtp = async (req) => {
  try {
    const { email, OTP } = req.body;
    let otpAttempt = 0;

    const fieldsToCheck = [
      { value: email, error: "Email is required" },
      { value: OTP, error: "Otp is required" },
    ];
    const validationError = checkRequiredFields(fieldsToCheck);
    if (validationError) {
      throw new ErrorHandler(BAD_GATEWAY, validationError.error);
    }
    const otpRecord = await otp
      .findOne({
        status: "Active",
        email: email,
      })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!otpRecord) {
      throw new ErrorHandler(NOT_FOUND, `No generated OTP for this mail`);
    }
    if (otpRecord.isUsed) {
      throw new ErrorHandler(BAD_GATEWAY, "Already verified");
    }

    if (otpRecord) {
      const createdAtTime = moment(otpRecord.createdAt);
      const currentTime = moment();

      // Calculate the difference in minutes
      const minutesDiff = currentTime.diff(createdAtTime, "minutes");

      if (minutesDiff > 10) {
        throw new ErrorHandler(BAD_GATEWAY, "OTP Expired.");
      }
    }

    otpAttempt = otpRecord.attempts;

    if (otpAttempt > 3) {
      throw new ErrorHandler(BAD_GATEWAY, "Maximum attempt reached");
    }
    if (otpRecord.otp !== OTP) {
      otpAttempt = otpAttempt + 1;
      const filter = { _id: otpRecord._id };
      const update = { $set: { attempts: otpAttempt } };
      const options = { new: true };

      await otp.findOneAndUpdate(filter, update, options);
      throw new ErrorHandler(BAD_GATEWAY, "Invalid OTP");
    }
    const filter = { _id: otpRecord._id };
    const update = { $set: { isUsed: true } };
    const options = { new: true };

    await otp.findOneAndUpdate(filter, update, options);
    await otpCount.findOneAndUpdate(
      { email: email },
      { status: "Inactive" },
      { new: true }
    );
    return { message: "OTP Verified" };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

async function CheckSession(method, email) {
  try {
    const checkSession = await session.findOne({
      email: email,
      status: "Active",
    });

    if (checkSession) {
      throw new ErrorHandler(CONFLICT, "Session already active");
    }
    const checkemail = await userCredentials.findOne({ email: email });

    if (method === "signup" && checkemail) {
      throw new ErrorHandler(CONFLICT, "Email already exists");
    }
    if (method === "forgetPassword" && !checkemail) {
      throw new ErrorHandler(NOT_FOUND, "Email not found.");
    }

    return true;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
}

module.exports = {
  generateOtp,
  verifyOtp,
};
