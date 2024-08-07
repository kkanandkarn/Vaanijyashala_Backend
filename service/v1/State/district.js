const { default: mongoose } = require("mongoose");
const { ErrorHandler } = require("../../../helper");
const {
  SERVER_ERROR,
  BAD_GATEWAY,
  NOT_FOUND,
  CONFLICT,
} = require("../../../helper/status-codes");
const { state, district } = require("../../../models");
const { SERVER_ERROR_MESSAGE } = require("../../../utils/constant");
const { checkRequiredFields } = require("../../../utils/validations");

const addDistrict = async (req) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { stateId, districts = [] } = req.body;
    const userId = req.user.userId;
    if (!stateId || stateId === "") {
      throw new ErrorHandler(BAD_GATEWAY, "State id is required");
    }
    if (!districts.length) {
      throw new ErrorHandler(BAD_GATEWAY, "Districts are required");
    }
    const checkState = await state.findOne({
      _id: stateId,
      status: { $ne: "Deleted" },
    });
    if (!checkState) {
      throw new ErrorHandler(NOT_FOUND, "State not found");
    }
    const districtCounts = districts.reduce((acc, district) => {
      acc[district] = (acc[district] || 0) + 1;
      return acc;
    }, {});
    const duplicateDistrictsInRequest = Object.keys(districtCounts).filter(
      (district) => districtCounts[district] > 1
    );

    if (duplicateDistrictsInRequest.length > 0) {
      throw new ErrorHandler(
        CONFLICT,
        `Duplicate districts found: ${duplicateDistrictsInRequest.join(", ")}`
      );
    }

    const duplicateDistricts = [];

    await Promise.all(
      districts.map(async (districtName) => {
        const checkDistrict = await district.findOne({
          title: districtName,
          stateId: stateId,
          status: { $ne: "Deleted" },
        });
        if (checkDistrict) {
          duplicateDistricts.push(districtName);
        } else {
          const newDistrict = new district({
            title: districtName,
            stateId: stateId,
            createdBy: userId,
            updatedBy: userId,
          });
          await newDistrict.save({ session });
        }
      })
    );

    if (duplicateDistricts.length) {
      throw new ErrorHandler(
        CONFLICT,
        `District(s) already exists: ${duplicateDistricts}`
      );
    }

    await session.commitTransaction();
    session.endSession();

    return { message: "district added" };
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
const editDistrict = async (req) => {
  try {
    const { stateId, districtId, districtName } = req.body;
    const userId = req.user.userId;
    if (!stateId || stateId === "") {
      throw new ErrorHandler(BAD_GATEWAY, "State id is required");
    }
    if (!districtId || districtId === "") {
      throw new ErrorHandler(BAD_GATEWAY, "District id is required");
    }
    if (!districtName || districtName === "") {
      throw new ErrorHandler(BAD_GATEWAY, "New district name is required");
    }

    const checkState = await state.findOne({
      _id: stateId,
      status: { $ne: "Deleted" },
    });
    if (!checkState) {
      throw new ErrorHandler(NOT_FOUND, "State not found");
    }

    const checkDistrict = await district.findOne({
      _id: districtId,
      stateId: stateId,
      status: { $ne: "Deleted" },
    });

    if (!checkDistrict) {
      throw new ErrorHandler(NOT_FOUND, "District not found");
    }

    const checkDuplicacy = await district.findOne({
      title: districtName,
      stateId: stateId,
      status: { $ne: "Deleted" },
    });

    if (checkDuplicacy) {
      throw new ErrorHandler(CONFLICT, "District already exists");
    }
    await district.findByIdAndUpdate(districtId, {
      title: districtName,
      updatedBy: userId,
      updatedAt: new Date(),
    });

    return { message: "District name updated successfully" };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const viewDistrict = async (req) => {
  try {
    const { stateId } = req.body;
    if (!stateId || stateId === "") {
      throw new ErrorHandler(BAD_GATEWAY, "State id is required.");
    }
    const stateData = await state.findOne({
      _id: stateId,
      status: { $ne: "Deleted" },
    });

    if (!stateData) {
      throw new ErrorHandler(NOT_FOUND, "No state found");
    }

    const districts = await district
      .find({
        stateId: stateId,
        status: { $ne: "Deleted" },
      })
      .sort({ title: 1 });
    return {
      districts: districts,
    };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const deleteDistrict = async (req) => {
  try {
    const { stateId, districtId } = req.body;
    const userId = req.user.userId;
    if (!stateId || stateId === "") {
      throw new ErrorHandler(BAD_GATEWAY, "State id is required.");
    }
    if (!districtId || districtId === "") {
      throw new ErrorHandler(BAD_GATEWAY, "District id is required.");
    }

    const checkState = await state.findOne({
      _id: stateId,
      status: { $ne: "Deleted" },
    });

    if (!checkState) {
      throw new ErrorHandler(NOT_FOUND, "State not found");
    }

    const checkDistrict = await district.findOne({
      _id: districtId,
      stateId: stateId,
      status: { $ne: "Deleted" },
    });

    if (!checkDistrict) {
      throw new ErrorHandler(NOT_FOUND, "District not found");
    }

    await district.findByIdAndUpdate(districtId, {
      status: "Deleted",
      updatedBy: userId,
      updatedAt: new Date(),
    });

    return { message: "District deleted successfully" };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

module.exports = {
  addDistrict,
  editDistrict,
  viewDistrict,
  deleteDistrict,
};
