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

    // Check for duplicate districts in the database
    const existingDistrict = await state
      .findOne({ _id: stateId, status: { $ne: "Deleted" } })
      .select("districts")
      .lean();

    const existingDistrictNames = existingDistrict.districts.map((d) => d.name);

    const duplicateDistrictsInDB = districts.filter((district) =>
      existingDistrictNames.includes(district)
    );

    if (duplicateDistrictsInDB.length > 0) {
      throw new ErrorHandler(
        CONFLICT,
        `District(s) already exists: ${duplicateDistrictsInDB.join(", ")} `
      );
    }
    const newDistricts = districts.map((district) => ({ name: district }));
    await state.updateOne(
      { _id: stateId },
      {
        $push: { districts: { $each: newDistricts } },
        $set: { updatedBy: userId, updatedAt: new Date() },
      }
    );

    return { message: "district added" };
  } catch (error) {
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

    console.log(checkState);

    const existingDistrict = checkState.districts.find(
      (district) => district._id.toString() === districtId
    );

    console.log("existingDistrict=> ", existingDistrict);

    if (!existingDistrict) {
      throw new ErrorHandler(
        NOT_FOUND,
        "District not found in the specified state"
      );
    }

    // Check for duplicate district names
    const duplicateDistrictName = checkState.districts.some(
      (district) => district.name === districtName
    );
    console.log("duplicateDistrictName => ", duplicateDistrictName);

    if (duplicateDistrictName) {
      throw new ErrorHandler(CONFLICT, "Duplicate district name found");
    }

    // Update the district name
    await state.updateOne(
      { _id: stateId, "districts._id": districtId },
      {
        $set: {
          "districts.$.name": districtName,
          updatedBy: userId,
          updatedAt: new Date(),
        },
      }
    );

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

    console.log("old state data => ", stateData);

    const sortedDistricts = stateData.districts.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    console.log("sortedDistricts=>  ", sortedDistricts);
    stateData["districts"] = sortedDistricts;
    console.log("new state => ", stateData);
    return {
      districts: stateData,
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

    const existingDistrict = checkState.districts.find(
      (district) => district._id.toString() === districtId
    );

    if (!existingDistrict) {
      throw new ErrorHandler(
        NOT_FOUND,
        "District not found in the specified state"
      );
    }

    // Remove the district from the state's districts array
    await state.updateOne(
      { _id: stateId },
      {
        $pull: { districts: { _id: districtId } },
        $set: { updatedBy: userId, updatedAt: new Date() },
      }
    );

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
