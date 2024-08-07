const { default: mongoose } = require("mongoose");
const { ErrorHandler } = require("../../../helper");
const {
  SERVER_ERROR,
  BAD_GATEWAY,
  CONFLICT,
  NOT_FOUND,
} = require("../../../helper/status-codes");
const { state, district } = require("../../../models");
const { SERVER_ERROR_MESSAGE } = require("../../../utils/constant");
const { checkRequiredFields } = require("../../../utils/validations");

const addState = async (req) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { stateName, districts = [] } = req.body;
    const userId = req.user.userId;

    if (!stateName || stateName === "") {
      throw new ErrorHandler(BAD_GATEWAY, "State name is required.");
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

    const checkState = await state.findOne({
      title: stateName,
      status: { $ne: "Deleted" },
    });

    if (checkState) {
      throw new ErrorHandler(CONFLICT, "State already exists.");
    }

    const newState = new state({
      title: stateName,
      createdBy: userId,
      updatedBy: userId,
    });

    await newState.save({ session });

    const stateId = newState._id;

    await Promise.all(
      await districts.map(async (districtName) => {
        const checkDistrict = await district.findOne({
          title: districtName,
          stateId: stateId,
          status: { $ne: "Deleted" },
        });
        if (checkDistrict) {
          throw new ErrorHandler(BAD_GATEWAY, "District already exists");
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

    await session.commitTransaction();
    session.endSession();

    return { message: "State Added" };
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

const viewStates = async (req) => {
  try {
    const states = await state.aggregate([
      {
        $match: {
          status: "Active",
        },
      },
      {
        $sort: {
          title: 1,
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "_id",
          foreignField: "stateId",
          as: "districts",
        },
      },
      {
        $unwind: "$districts",
      },
      {
        $match: {
          "districts.status": "Active",
        },
      },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          status: { $first: "$status" },
          createdBy: { $first: "$createdBy" },
          updatedBy: { $first: "$updatedBy" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          districts: { $push: "$districts" },
        },
      },
      {
        $addFields: {
          districts: {
            $sortArray: { input: "$districts", sortBy: { title: 1 } },
          },
        },
      },
      {
        $sort: {
          title: 1,
        },
      },
    ]);
    return { states: states };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const editState = async (req) => {
  try {
    const { id, stateName } = req.body;
    const userId = req.user.userId;
    const fieldsToCheck = [
      { value: id, error: "Id is required" },
      { value: stateName, error: "State name is required." },
    ];
    const validationError = checkRequiredFields(fieldsToCheck);
    if (validationError) {
      throw new ErrorHandler(BAD_GATEWAY, validationError.error);
    }
    const states = await state.findOne({ _id: id, status: { $ne: "Deleted" } });
    if (!states) {
      throw new ErrorHandler(NOT_FOUND, "State not found");
    }
    const duplicacy = await state.findOne({
      title: stateName,
      status: { $ne: "Deleted" },
    });
    if (duplicacy) {
      throw new ErrorHandler(CONFLICT, "State already exists");
    }
    await state.findByIdAndUpdate(id, {
      title: stateName,
      updatedBy: userId,
      updatedAt: new Date(),
    });
    return { message: "State updated successfully" };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const deleteState = async (req) => {
  try {
    const { id } = req.body;
    const userId = req.user.userId;
    if (!id || id === "") {
      throw new ErrorHandler(BAD_GATEWAY, "Id is required");
    }
    const states = await state.findOne({ _id: id, status: { $ne: "Deleted" } });
    if (!states) {
      throw new ErrorHandler(NOT_FOUND, "State not found");
    }
    await state.findByIdAndUpdate(id, {
      status: "Deleted",
      updatedBy: userId,
      updatedAt: new Date(),
    });

    await district.updateMany(
      { stateId: id },
      {
        status: "Deleted",
        updatedBy: userId,
        updatedAt: new Date(),
      }
    );
    return { message: "State deleted successfully" };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

module.exports = {
  addState,
  viewStates,
  editState,
  deleteState,
};
