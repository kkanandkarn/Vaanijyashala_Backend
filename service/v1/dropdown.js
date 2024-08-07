const { default: mongoose } = require("mongoose");
const { ErrorHandler } = require("../../helper");
const {
  NOT_FOUND,
  SERVER_ERROR,
  BAD_GATEWAY,
} = require("../../helper/status-codes");
const { DropdownQuery } = require("../../models");
const { SERVER_ERROR_MESSAGE } = require("../../utils/constant");

const dropdown = async (req) => {
  try {
    const { dropdownCode, replacements = [] } = req.body;

    const dropdownQuery = await DropdownQuery.findOne({
      dropdown_code: dropdownCode,
      status: "Active",
    });

    if (!dropdownQuery) {
      throw new ErrorHandler(NOT_FOUND, "Dropdown code not found");
    }

    let query = JSON.parse(dropdownQuery.query);
    let conditions = JSON.parse(dropdownQuery.conditions || "{}");

    if (Object.keys(conditions).length > 0 && replacements.length === 0) {
      throw new ErrorHandler(
        BAD_GATEWAY,
        "This dropdown code needs replacements"
      );
    }

    let findVal = dropdownQuery.conditions.match(/\?/g) || [];
    if (replacements.length !== findVal.length) {
      throw new ErrorHandler(
        422,
        `replacements array length must be ${findVal.length}`
      );
    }

    for (let i = 0; i < replacements.length; i++) {
      conditions = JSON.parse(
        JSON.stringify(conditions).replace("?", replacements[i])
      );
    }

    if (!conditions.status) {
      conditions.status = "Active";
    }

    const sortCriteria = JSON.parse(dropdownQuery.order_by || "{}");

    const dropdownData = await mongoose
      .model(query.collection)
      .find(conditions)
      .sort(sortCriteria);

    if (!dropdownData.length) {
      return [];
    }

    return dropdownData;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

module.exports = {
  dropdown,
};
