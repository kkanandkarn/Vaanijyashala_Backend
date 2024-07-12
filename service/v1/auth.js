const { default: mongoose } = require("mongoose");
const { ErrorHandler } = require("../../helper");
const {
  BAD_GATEWAY,
  CONFLICT,
  NOT_FOUND,
  SERVER_ERROR,
  UNAUTHORIZED,
} = require("../../helper/status-codes");
const { userCredentials, count, roles } = require("../../models");
const { SERVER_ERROR_MESSAGE } = require("../../utils/constant");
const { hashPassword, compare } = require("../../utils/hash");
const {
  checkRequiredFields,
  validateEmail,
  validateOtp,
} = require("../../utils/validations");
const token = require("../../utils/token");

const register = async (req) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { role, name, email, referralCode, isAgreeTermsCondition, password } =
      req.body;
    const fieldsToCheck = [
      { value: role, error: "role is required" },
      { value: name, error: "Name is required" },
      { value: email, error: "Email is required" },
      { value: password, error: "Password is required" },
      {
        value: isAgreeTermsCondition,
        error: "Please agree to our terms and condition and privacy policy",
      },
    ];
    const validationError = checkRequiredFields(fieldsToCheck);
    if (validationError) {
      throw new ErrorHandler(BAD_GATEWAY, validationError.error);
    }
    const isValidEMail = validateEmail(email);
    if (!isValidEMail) {
      throw new ErrorHandler(BAD_GATEWAY, "Inavlid email");
    }
    const checkUser = await userCredentials.findOne({ email: email });

    if (checkUser) {
      throw new ErrorHandler(CONFLICT, "Email already exists.");
    }
    const verifyOTP = await validateOtp(email);
    if (!verifyOTP.success) {
      throw new ErrorHandler(BAD_GATEWAY, "please verify otp to continue.");
    }
    const hashedPassword = await hashPassword(password);
    let newUser;

    if (referralCode && referralCode !== "") {
      const checkref = await userCredentials.findOne({
        referralCode: referralCode,
        status: "Active",
      });

      if (!checkref) {
        throw new ErrorHandler(NOT_FOUND, "Referral Code not found");
      }
      newUser = new userCredentials({
        name: name,
        email: email,
        password: hashedPassword,
        role: role,
        isAgreeTermsCondition: isAgreeTermsCondition,
        parentId: checkref._id,
      });
      await newUser.save({ session });
      let referredUser = checkref.referredUsers + 1;

      await userCredentials.findByIdAndUpdate(
        checkref._id,
        { referredUsers: referredUser, updatedAt: Date.now() },
        { new: true, session }
      );
    } else {
      newUser = new userCredentials({
        name: name,
        email: email,
        password: hashedPassword,
        role: role,
        isAgreeTermsCondition: isAgreeTermsCondition,
      });
      await newUser.save({ session });
    }
    const Count = await count.findOne({ status: "Active" });

    const userCount = Count.usersCount + 1;
    const sellerCount = Count.sellerCount + 1;
    await count.findByIdAndUpdate(
      Count._id,
      { userCount: userCount, sellerCount: sellerCount, updatedAt: Date.now() },
      { new: true, session }
    );
    const uniqueId = `VSM${100 + sellerCount}`;
    const newReferralCode = `VSMR${100 + sellerCount}`;

    await userCredentials.findOneAndUpdate(
      { email: email },
      { $set: { uniqueId: uniqueId, referralCode: newReferralCode } },
      { new: true, session }
    );
    const findRole = await roles.findById(role);
    const roleName = findRole.title;
    const userId = newUser._id;

    const Token = token(userId, roleName);
    const returnUser = {
      userId: userId,
      userName: name,
      userEmail: email,
      role: roleName,
    };

    await session.commitTransaction();
    session.endSession();

    return { message: "Register successfull", user: returnUser, token: Token };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const login = async (req) => {
  try {
    const { email, password } = req.body;
    const fieldsToCheck = [
      { value: email, error: "Email is required." },
      { value: password, error: "Password is required" },
    ];
    const validationError = checkRequiredFields(fieldsToCheck);
    if (validationError) {
      throw new ErrorHandler(BAD_GATEWAY, validationError.error);
    }
    const isValidEMail = validateEmail(email);
    if (!isValidEMail) {
      throw new ErrorHandler(BAD_GATEWAY, "Invalid email");
    }
    const user = await userCredentials
      .findOne({ email: email })
      .populate("role");
    if (!user) {
      throw new ErrorHandler(UNAUTHORIZED, "Invalid email or password");
    }
    const verifyPassword = await compare(user.password, password);
    if (!verifyPassword) {
      throw new ErrorHandler(UNAUTHORIZED, "Invalid email or password");
    }

    const returnUser = {
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      role: user.role.title,
    };
    const Token = token(user._id, user.role.title);
    return { message: "Login successfull", user: returnUser, token: Token };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

module.exports = {
  register,
  login,
};
