const { ErrorHandler } = require("../../helper");
const { BAD_GATEWAY, SERVER_ERROR } = require("../../helper/status-codes");
const { sysCode } = require("../../models");
const mongoose = require("mongoose");
const { SERVER_ERROR_MESSAGE } = require("../../utils/constant");

const dropdownCode = async (req) => {
  try {
    const { dropdownCode, replacements = {} } = req.body;
    let data;
    if (!dropdownCode || dropdownCode === "") {
      throw new ErrorHandler(BAD_GATEWAY, "Dropdown code is required");
    }
    const sys = await sysCode.findOne({ dropdownCode: dropdownCode });

    if (!sys) {
      throw new ErrorHandler(BAD_GATEWAY, "Dropdown code not found");
    }

    const collectionName = sys.collectionName;

    // Dynamically get the collection
    const collection = mongoose.connection.collections[collectionName];

    if (!collection) {
      throw new ErrorHandler(
        BAD_GATEWAY,
        `Collection ${collectionName} not found`
      );
    }

    replacements["status"] = "Active";

    data = await collection.find(replacements).toArray();

    return { message: "success", data: data };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

module.exports = dropdownCode;
