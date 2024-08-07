const { default: mongoose } = require("mongoose");
const { ErrorHandler } = require("../../../helper");
const {
  SERVER_ERROR,
  BAD_GATEWAY,
  CONFLICT,
  NOT_FOUND,
} = require("../../../helper/status-codes");
const { userCredentials, roles, count } = require("../../../models");
const { SERVER_ERROR_MESSAGE } = require("../../../utils/constant");
const { checkRequiredFields } = require("../../../utils/validations");
const { hashPassword } = require("../../../utils");

const createUser = async (req) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, email, password, role } = req.body;
    const userId = req.user.userId;
    const fieldsToCheck = [
      { value: name, error: "Name is required." },
      { value: email, error: "Email is required." },
      { value: password, error: "Password is required." },
      { value: role, error: "Role is required" },
    ];
    const validationError = checkRequiredFields(fieldsToCheck);
    if (validationError) {
      throw new ErrorHandler(BAD_GATEWAY, validationError.error);
    }
    const checkUser = await userCredentials.findOne({ email: email });
    if (checkUser) {
      throw new ErrorHandler(CONFLICT, "Email already exists.");
    }
    const checkRole = await roles.findOne({
      _id: role,
      status: { $ne: "Deleted" },
    });
    if (!checkRole) {
      throw new ErrorHandler(NOT_FOUND, "No role found");
    }
    if (checkRole.status === "Inactive") {
      throw new ErrorHandler(
        BAD_GATEWAY,
        "Cannot create user on inactive role"
      );
    }
    const hashedPassword = await hashPassword(password);
    const alias = checkRole.alias;
    const count = await userCredentials.countDocuments({ role: role });
    const totalUser = await userCredentials.countDocuments();

    const uniqueId = `${alias}${101 + count}`;
    const newReferralCode = `VSR${100 + totalUser}`;

    const newUser = new userCredentials({
      uniqueId: uniqueId,
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
      isLogin: false,
      referralCode: newReferralCode,
      referredUsers: 0,
      createdBy: userId,
      updatedBy: userId,
    });

    await newUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    return { message: "User created" };
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

const viewUsers = async (req) => {
  try {
    const users = await userCredentials
      .find({ status: { $ne: "Deleted" } })
      .select(
        "uniqueId name email role isLogin referralCode referredUsers status"
      )
      .populate("role", "title")
      .sort({ updatedAt: -1 });

    return { users: users };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const editUser = async (req) => {
  try {
    const { id, name, email, password, role } = req.body;
    const userId = req.user.userId;
    const fieldsToCheck = [
      { value: id, error: "User id is required." },
      { value: name, error: "Name is required." },
      { value: email, error: "Email is required." },
      { value: role, error: "Role is required" },
    ];
    const validationError = checkRequiredFields(fieldsToCheck);
    if (validationError) {
      throw new ErrorHandler(BAD_GATEWAY, validationError.error);
    }
    const checkUser = await userCredentials.findOne({
      _id: id,
      status: { $ne: "Deleted" },
    });
    if (!checkUser) {
      throw new ErrorHandler(NOT_FOUND, "User not found");
    }
    const checkEmail = await userCredentials.findOne({
      email: email,
    });

    if (email !== checkUser.email && checkEmail) {
      throw new ErrorHandler(CONFLICT, "Email already exists");
    }
    const checkRole = await roles.findOne({
      _id: role,
      status: { $ne: "Deleted" },
    });
    if (!checkRole) {
      throw new ErrorHandler(NOT_FOUND, "No role found");
    }
    if (checkRole.status === "Inactive") {
      throw new ErrorHandler(
        BAD_GATEWAY,
        "Cannot create user on inactive role"
      );
    }
    let userPassword = checkUser.password;
    if (password) {
      userPassword = await hashPassword(password);
    }

    await userCredentials.findByIdAndUpdate(id, {
      name: name,
      email: email,
      password: userPassword,
      role: role,
      updatedBy: userId,
      updatedAt: new Date(),
    });

    return { message: "User updated" };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const deleteUser = async (req) => {
  try {
    const { id } = req.body;
    const userId = req.user.userId;
    if (!id || id === "") {
      throw new ErrorHandler(BAD_GATEWAY, "Id is required");
    }
    const checkUser = await userCredentials.findOne({
      _id: id,
      status: { $ne: "Deleted" },
    });
    if (!checkUser) {
      throw new ErrorHandler(NOT_FOUND, "User not found");
    }
    await userCredentials.findByIdAndUpdate(id, {
      status: "Deleted",
      updatedBy: userId,
      updatedAt: new Date(),
    });
    return { message: "User deleted successfully." };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const changeUserStatus = async (req) => {
  try {
    const { id, status } = req.body;
    const userId = req.user.userId;
    const fieldsToCheck = [
      { value: id, error: "User id is required." },
      { value: status, error: "Status is required" },
    ];
    const validationError = checkRequiredFields(fieldsToCheck);
    if (validationError) {
      throw new ErrorHandler(BAD_GATEWAY, validationError.error);
    }
    const checkUser = await userCredentials.findOne({
      _id: id,
      status: { $ne: "Deleted" },
    });
    if (!checkUser) {
      throw new ErrorHandler(NOT_FOUND, "User not found");
    }

    await userCredentials.findByIdAndUpdate(id, {
      status: status,
      updatedBy: userId,
      updatedAt: new Date(),
    });

    return { message: "Status updated" };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

module.exports = {
  createUser,
  viewUsers,
  editUser,
  deleteUser,
  changeUserStatus,
};
