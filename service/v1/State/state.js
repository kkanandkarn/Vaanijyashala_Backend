const { ErrorHandler } = require("../../../helper");
const {
  SERVER_ERROR,
  BAD_GATEWAY,
  CONFLICT,
  NOT_FOUND,
} = require("../../../helper/status-codes");
const { state } = require("../../../models");
const { SERVER_ERROR_MESSAGE } = require("../../../utils/constant");
const { checkRequiredFields } = require("../../../utils/validations");

const addState = async (req) => {
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

    // Check if the state already exists
    const checkState = await state.findOne({
      title: stateName,
      status: { $ne: "Deleted" },
    });

    if (checkState) {
      throw new ErrorHandler(CONFLICT, "State already exists.");
    }

    // Check for duplicate districts in the database
    // const existingStates = await state
    //   .find({ status: { $ne: "Deleted" } })
    //   .select("districts")
    //   .lean();
    // const allExistingDistricts = existingStates.flatMap((s) => s.districts);

    // const duplicateDistrictsInDB = districts.filter((district) =>
    //   allExistingDistricts.includes(district)
    // );

    // if (duplicateDistrictsInDB.length > 0) {
    //   throw new ErrorHandler(
    //     CONFLICT,
    //     `Duplicate districts found in database: ${duplicateDistrictsInDB.join(
    //       ", "
    //     )}`
    //   );
    // }
    const districtObjects = districts.map((districtName) => ({
      name: districtName,
    }));

    const newState = new state({
      title: stateName,
      districts: districtObjects,
      createdBy: userId,
      updatedBy: userId,
    });

    await newState.save();
    return { message: "State Added" };
  } catch (error) {
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
      // Match states that are not deleted
      {
        $match: {
          status: { $ne: "Deleted" },
        },
      },
      // Unwind the districts array
      {
        $unwind: {
          path: "$districts",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Sort by state title and district name
      {
        $sort: {
          title: 1,
          "districts.name": 1,
        },
      },
      // Group back into state objects with sorted districts
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          status: { $first: "$status" },
          createdBy: { $first: "$createdBy" },
          updatedBy: { $first: "$updatedBy" },
          districts: {
            $push: "$districts",
          },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
      // Sort the states
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
