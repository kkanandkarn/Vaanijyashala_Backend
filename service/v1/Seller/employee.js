const { default: mongoose } = require("mongoose");
const { ErrorHandler } = require("../../../helper");
const {
  SERVER_ERROR,
  BAD_GATEWAY,
  CONFLICT,
  NOT_FOUND,
  LOCKED,
} = require("../../../helper/status-codes");
const {
  userCredentials,
  roles,
  count,
  employee,
  state,
} = require("../../../models");
const { hashPassword } = require("../../../utils");
const {
  SERVER_ERROR_MESSAGE,
  allowedImageTypes,
  MAX_FILE_SIZE_BYTES,
} = require("../../../utils/constant");
const {
  checkRequiredFields,
  validateEmail,
} = require("../../../utils/validations");
const { sellerViewProducts } = require("./product");
const cloudinary = require("cloudinary").v2;
const { fetchRoleId } = require("../../../utils/fetchId");
const addEmployee = async (req) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user.userId;
    const findUser = await userCredentials.findOne({ _id: userId });
    const userStatus = findUser.status;
    if (userStatus === "Hold") {
      throw new ErrorHandler(
        LOCKED,
        "Your account is on hold. Cannot add new employee"
      );
    }

    const {
      name,
      email,
      password,
      dateOfBirth,
      gender,
      mobileNumber,
      altMobileNumber,
      addressLine1,
      state,
      district,
      permissions = [],
    } = req.body;

    const fieldsToCheck = [
      { value: name, error: "Name is required." },
      { value: email, error: "Email is required." },
      { value: password, error: "Password is required." },
      { value: dateOfBirth, error: "Date of birth is required." },
      { value: gender, error: "Gender is required" },
      { value: addressLine1, error: "Address line is required." },
      { value: state, error: "State is required." },
      { value: district, error: "District line is required." },
    ];
    const validationError = checkRequiredFields(fieldsToCheck);
    if (validationError) {
      throw new ErrorHandler(BAD_GATEWAY, validationError.error);
    }
    if (!permissions.length) {
      throw new ErrorHandler(BAD_GATEWAY, "Permissions are required");
    }

    if (mobileNumber && altMobileNumber && mobileNumber === altMobileNumber) {
      throw new ErrorHandler(
        BAD_GATEWAY,
        "Mobile number and Alt Mobile no. cannot be same."
      );
    }
    let profileImagePath = "";

    if (req.files.profileImg) {
      const profileImg = req.files.profileImg[0];

      if (!allowedImageTypes.includes(profileImg.mimetype)) {
        throw new ErrorHandler(BAD_GATEWAY, "Inavlid profile image type.");
      }

      if (profileImg.size > MAX_FILE_SIZE_BYTES) {
        throw new ErrorHandler(
          BAD_GATEWAY,
          "Profile image should be less than 5 mb"
        );
      }
      profileImagePath = req.files.profileImg[0].path;
    }

    let idFilePath = "";
    if (req.files.idFile) {
      const allowedIdTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];

      const idFile = req.files.idFile[0];

      if (!allowedIdTypes.includes(idFile.mimetype)) {
        throw new ErrorHandler(BAD_GATEWAY, "Inavalid id file type.");
      }

      if (idFile.size > MAX_FILE_SIZE_BYTES) {
        throw new ErrorHandler(BAD_GATEWAY, "id file should be less than 5 mb");
      }

      idFilePath = req.files.idFile[0].path;
    }

    const hashedPassword = await hashPassword(password);

    const isValidEMail = validateEmail(email);
    if (!isValidEMail) {
      throw new ErrorHandler(BAD_GATEWAY, "Inavlid email");
    }
    const checkUser = await userCredentials.findOne({
      email: email,
    });
    if (checkUser) {
      throw new ErrorHandler(CONFLICT, "Email already exists");
    }

    const checkRole = await roles.findOne({ title: "Employee" });

    const role = checkRole._id;

    const alias = checkRole.alias;
    const count = await userCredentials.countDocuments({ role: role });
    const totalUser = await userCredentials.countDocuments();

    const uniqueId = `${alias}${101 + count}`;
    const newReferralCode = `VSR${100 + totalUser}`;

    const newUser = new userCredentials({
      uniqueId: uniqueId,
      referralCode: newReferralCode,
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
      tenantId: userId,
      createdBy: userId,
      updatedBy: userId,
    });
    await newUser.save({ session });
    const newUserId = newUser._id;

    const newEmployee = new employee({
      tenantId: userId,
      userId: newUserId,
      profileImg: profileImagePath,
      name: name,
      email: email,
      password: hashedPassword,
      dateOfBirth: dateOfBirth,
      gender: gender,
      mobileNumber: mobileNumber || "",
      altMobileNumber: altMobileNumber || "",
      addressLine1: addressLine1,
      state: state,
      district: district,
      permissions: permissions,
      idFile: idFilePath,
      createdBy: userId,
      updatedBy: userId,
    });

    await newEmployee.save({ session });
    await session.commitTransaction();
    session.endSession();

    return { message: "Employee added successfully." };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (req.files && req.files.profileImg) {
      await cloudinary.uploader.destroy(
        req.files.profileImg[0].filename,
        (err, result) => {
          if (err) {
            console.error("Error deleting file from Cloudinary:", err);
          } else {
            console.log("Deleted file from Cloudinary:", result);
          }
        }
      );
    }
    if (req.files && req.files.idFile) {
      await cloudinary.uploader.destroy(
        req.files.idFile[0].filename,
        (err, result) => {
          if (err) {
            console.error("Error deleting file from Cloudinary:", err);
          } else {
            console.log("Deleted file from Cloudinary:", result);
          }
        }
      );
    }
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const sellerViewEmployees = async (req) => {
  try {
    const tenantId = req.user.userId;

    const employees = await employee
      .find({ tenantId: tenantId, status: { $ne: "Deleted" } })
      .sort({ updatedAt: -1 })
      .populate({
        path: "userId",
        model: userCredentials,
        select: "-password",
        populate: [{ path: "role", model: "roles" }],
      })
      .populate("gender", "title")
      .populate("state", "title")
      .populate("district", "title")
      .populate("permissions", "permissionName")
      .exec();

    return { employees: employees };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const sellerViewEmployeeById = async (req) => {
  try {
    const tenantId = req.user.userId;
    const { id } = req.params;

    const Employee = await employee
      .findOne({ userId: id, tenantId: tenantId, status: { $ne: "Deleted" } })
      .sort({ updatedAt: -1 })
      .populate({
        path: "userId",
        model: userCredentials,
        select: "-password",
        populate: [{ path: "role", model: "roles" }],
      })
      .populate("gender", "title")
      .populate("state", "title")
      .populate("district", "title")
      .populate("permissions", "permissionName")
      .exec();
    return { employee: Employee };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const sellerEditEmployee = async (req) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user.userId;
    const findUser = await userCredentials.findOne({ _id: userId });
    const userStatus = findUser.status;
    if (userStatus === "Hold") {
      throw new ErrorHandler(
        LOCKED,
        "Your account is on hold. Cannot edit employee."
      );
    }

    const {
      id,
      name,
      email,
      password,
      dateOfBirth,
      gender,
      mobileNumber,
      altMobileNumber,
      addressLine1,
      state,
      district,
      status,
      permissions = [],
    } = req.body;

    const fieldsToCheck = [
      { value: id, error: "id is required" },
      { value: name, error: "Name is required." },
      { value: email, error: "Email is required." },
      { value: dateOfBirth, error: "Date of birth is required." },
      { value: gender, error: "Gender is required" },
      { value: addressLine1, error: "Address line is required." },
      { value: state, error: "State is required." },
      { value: district, error: "District line is required." },
      { value: status, error: "status is required." },
    ];
    const validationError = checkRequiredFields(fieldsToCheck);
    if (validationError) {
      throw new ErrorHandler(BAD_GATEWAY, validationError.error);
    }
    if (!permissions.length) {
      throw new ErrorHandler(BAD_GATEWAY, "Permissions are required");
    }

    if (mobileNumber && altMobileNumber && mobileNumber === altMobileNumber) {
      throw new ErrorHandler(
        BAD_GATEWAY,
        "Mobile number and Alt Mobile no. cannot be same."
      );
    }

    const isValidEMail = validateEmail(email);
    if (!isValidEMail) {
      throw new ErrorHandler(BAD_GATEWAY, "Inavlid email");
    }
    const checkId = await userCredentials.findOne({
      _id: id,
      tenantId: userId,
      status: { $ne: "Deleted" },
    });

    if (!checkId) {
      throw new ErrorHandler(NOT_FOUND, "Employee not found");
    }
    if (email !== checkId.email) {
      const checkUser = await userCredentials.findOne({
        email: email,
      });
      if (checkUser) {
        throw new ErrorHandler(CONFLICT, "Email already exists");
      }
    }

    let newPassword;
    if (password) {
      newPassword = await hashPassword(password);
    }
    if (!password) {
      newPassword = checkId.password;
    }

    let profileImagePath = checkId.profileImg;

    if (req.files.profileImg) {
      const profileImg = req.files.profileImg[0];

      if (!allowedImageTypes.includes(profileImg.mimetype)) {
        throw new ErrorHandler(BAD_GATEWAY, "Inavlid profile image type.");
      }

      if (profileImg.size > MAX_FILE_SIZE_BYTES) {
        throw new ErrorHandler(
          BAD_GATEWAY,
          "Profile image should be less than 5 mb"
        );
      }
      profileImagePath = req.files.profileImg[0].path;
    }

    let idFilePath = checkId.idFile;
    if (req.files.idFile) {
      const allowedIdTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];

      const idFile = req.files.idFile[0];

      if (!allowedIdTypes.includes(idFile.mimetype)) {
        throw new ErrorHandler(BAD_GATEWAY, "Inavalid id file type.");
      }

      if (idFile.size > MAX_FILE_SIZE_BYTES) {
        throw new ErrorHandler(BAD_GATEWAY, "id file should be less than 5 mb");
      }

      idFilePath = req.files.idFile[0].path;
    }

    await userCredentials
      .findByIdAndUpdate(id, {
        name: name,
        email: email,
        password: newPassword,
        status: status,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .session(session);

    const filter = { userId: id };
    const update = {
      profileImg: profileImagePath,
      name: name,
      email: email,
      password: newPassword,
      dateOfBirth: dateOfBirth,
      gender: gender,
      mobileNumber: mobileNumber || "",
      altMobileNumber: altMobileNumber || "",
      addressLine1: addressLine1,
      state: state,
      district: district,
      permissions: permissions,
      idFile: idFilePath,
      status: status,
      updatedBy: userId,
      updatedAt: new Date(),
    };

    await employee.findOneAndUpdate(filter, update).session(session);

    await session.commitTransaction();
    session.endSession();

    return { message: "Employee updated successfully." };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (req.files && req.files.profileImg) {
      await cloudinary.uploader.destroy(
        req.files.profileImg[0].filename,
        (err, result) => {
          if (err) {
            console.error("Error deleting file from Cloudinary:", err);
          } else {
            console.log("Deleted file from Cloudinary:", result);
          }
        }
      );
    }
    if (req.files && req.files.idFile) {
      await cloudinary.uploader.destroy(
        req.files.idFile[0].filename,
        (err, result) => {
          if (err) {
            console.error("Error deleting file from Cloudinary:", err);
          } else {
            console.log("Deleted file from Cloudinary:", result);
          }
        }
      );
    }
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const sellerDeleteEmployee = async (req) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { ids = [] } = req.body;
    const userId = req.user.userId;
    const findUser = await userCredentials.findOne({ _id: userId });
    const userStatus = findUser.status;
    if (userStatus === "Hold") {
      throw new ErrorHandler(
        LOCKED,
        "Your account is on hold. Cannot delete employee"
      );
    }
    if (!ids.length) {
      throw new ErrorHandler(BAD_GATEWAY, "ids are required");
    }

    const roleId = await fetchRoleId("Employee");

    await Promise.all(
      await ids.map(async (id) => {
        const checkId = await userCredentials.findOne({
          _id: id,
          role: roleId,
          tenantId: userId,
          status: { $ne: "Deleted" },
        });
        if (!checkId) {
          throw new ErrorHandler(NOT_FOUND, "Employee not found.");
        } else {
          await userCredentials
            .findByIdAndUpdate(id, {
              status: "Deleted",
              updatedBy: userId,
              updatedAt: new Date(),
            })
            .session(session);
          const filter = { userId: id };
          const update = {
            status: "Deleted",
            updatedBy: userId,
            updatedAt: new Date(),
          };
          await employee.findOneAndUpdate(filter, update).session(session);
        }
      })
    );

    await session.commitTransaction();
    session.endSession();
    return { message: "Employee(s) deleted successfully." };
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

module.exports = {
  addEmployee,
  sellerViewEmployees,
  sellerViewEmployeeById,
  sellerEditEmployee,
  sellerDeleteEmployee,
};
