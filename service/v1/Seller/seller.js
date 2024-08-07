const { ErrorHandler } = require("../../../helper");
const {
  BAD_GATEWAY,
  SERVER_ERROR,
  CONFLICT,
  LOCKED,
} = require("../../../helper/status-codes");
const { seller, userCredentials } = require("../../../models");
const { SERVER_ERROR_MESSAGE } = require("../../../utils/constant");
const { isValidFile } = require("../../../utils/validate-image");
const { checkRequiredFields } = require("../../../utils/validations");
const cloudinary = require("cloudinary").v2;

const sellerProfile = async (req) => {
  try {
    const userId = req.user.userId;
    const findUser = await userCredentials.findOne({ _id: userId });
    const userStatus = findUser.status;
    if (userStatus === "Hold") {
      throw new ErrorHandler(
        LOCKED,
        "Your account is on hold. Cannot update profile"
      );
    }
    const {
      dateOfBirth,
      gender,
      mobileNumber,
      altMobileNumber,
      shopLocality,
      shopCategory,
      state,
      district,
      pinCode,
      gstNo,
    } = req.body;
    const fieldsToCheck = [
      { value: dateOfBirth, error: "Date of birth is required." },
      { value: gender, error: "Gender is required" },
      { value: shopLocality, error: "Shop Locality is required" },
      { value: shopCategory, error: "Shop Type is required" },
      { value: state, error: "State is required" },
      { value: district, error: "District is required" },
      { value: pinCode, error: "Pin Code is required" },
    ];
    const validationError = checkRequiredFields(fieldsToCheck);
    if (validationError) {
      throw new ErrorHandler(BAD_GATEWAY, validationError.error);
    }
    if (mobileNumber && mobileNumber === altMobileNumber) {
      throw new ErrorHandler(
        BAD_GATEWAY,
        "Mobile number and Alt Mobile no. cannot be same."
      );
    }

    let profileImg = "";
    if (req.file) {
      const validateImage = isValidFile(req);
      if (!validateImage.success) {
        throw new ErrorHandler(BAD_GATEWAY, validateImage.error);
      }
      profileImg = req.file.path;
    }
    const checkSeller = await seller.findOne({
      userId: userId,
      status: { $ne: "Deleted" },
    });

    if (checkSeller) {
      throw new ErrorHandler(CONFLICT, "Profile already exists");
    }

    const newSeller = new seller({
      userId: userId,
      profileImg: profileImg,
      dateOfBirth: dateOfBirth,
      gender: gender,
      mobileNumber: mobileNumber || "",
      altMobileNumber: altMobileNumber || "",
      shopLocality: shopLocality,
      shopCategory: shopCategory,
      state: state,
      district: district,
      pinCode: pinCode,
      gstNo: gstNo || "",
    });
    await newSeller.save();
    return { message: "Profile created successfully." };
  } catch (error) {
    if (req.file && req.file.path) {
      await cloudinary.uploader.destroy(req.file.filename, (err, result) => {
        if (err) {
          console.error("Error deleting file from Cloudinary:", err);
        } else {
          console.log("Deleted file from Cloudinary:", result);
        }
      });
    }
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const sellerViewProfile = async (req) => {
  try {
    const userId = req.user.userId;

    const Seller = await seller
      .findOne({ userId: userId, status: { $ne: "Deleted" } })
      .sort({ updatedAt: -1 })
      .populate({
        path: "userId",
        model: userCredentials,
        select: "-password",
        populate: [{ path: "role", model: "roles" }],
      })
      .populate("gender", "title")
      .populate("shopCategory", "title")
      .populate("state", "title")
      .populate("district", "title")
      .exec();

    return { profile: Seller };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const sellerEditProfile = async (req) => {
  try {
    const userId = req.user.userId;
    const findUser = await userCredentials.findOne({ _id: userId });
    const userStatus = findUser.status;
    if (userStatus === "Hold") {
      throw new ErrorHandler(
        LOCKED,
        "Your account is on hold. Cannot update profile."
      );
    }
    const {
      dateOfBirth,
      gender,
      mobileNumber,
      altMobileNumber,
      shopLocality,
      shopCategory,
      state,
      district,
      pinCode,
      gstNo,
    } = req.body;
    const fieldsToCheck = [
      { value: dateOfBirth, error: "Date of birth is required." },
      { value: gender, error: "Gender is required" },
      { value: shopLocality, error: "Shop Locality is required" },
      { value: shopCategory, error: "Shop Type is required" },
      { value: state, error: "State is required" },
      { value: district, error: "District is required" },
      { value: pinCode, error: "Pin Code is required" },
    ];
    const validationError = checkRequiredFields(fieldsToCheck);
    if (validationError) {
      throw new ErrorHandler(BAD_GATEWAY, validationError.error);
    }
    if (mobileNumber && mobileNumber === altMobileNumber) {
      throw new ErrorHandler(
        BAD_GATEWAY,
        "Mobile number and Alt Mobile no. cannot be same."
      );
    }

    const Seller = await seller
      .findOne({ userId: userId, status: { $ne: "Deleted" } })
      .sort({ updatedAt: -1 })
      .populate({
        path: "userId",
        model: userCredentials,
        select: "-password",
        populate: [{ path: "role", model: "roles" }],
      })
      .populate("gender", "title")
      .populate("shopCategory", "title")
      .populate("state", "title")
      .populate("district", "title")
      .exec();

    let profileImg = Seller.profileImg;
    if (req.file) {
      const validateImage = isValidFile(req);
      if (!validateImage.success) {
        throw new ErrorHandler(BAD_GATEWAY, validateImage.error);
      }
      profileImg = req.file.path;
    }

    await seller.findByIdAndUpdate(Seller.id, {
      profileImg: profileImg,
      dateOfBirth: dateOfBirth,
      gender: gender,
      mobileNumber: mobileNumber || Seller.mobileNumber,
      altMobileNumber: altMobileNumber || Seller.altMobileNumber,
      shopLocality: shopLocality,
      shopCategory: shopCategory,
      state: state,
      district: district,
      pinCode: pinCode,
      gstNo: gstNo || Seller.gstNo,
      updatedBy: userId,
      updatedAt: new Date(),
    });

    return { message: "Profile updated successfully." };
  } catch (error) {
    if (req.file && req.file.path) {
      await cloudinary.uploader.destroy(req.file.filename, (err, result) => {
        if (err) {
          console.error("Error deleting file from Cloudinary:", err);
        } else {
          console.log("Deleted file from Cloudinary:", result);
        }
      });
    }
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

module.exports = {
  sellerProfile,
  sellerViewProfile,
  sellerEditProfile,
};
