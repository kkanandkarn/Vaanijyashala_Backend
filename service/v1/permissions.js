const { ErrorHandler } = require("../../helper");
const { SERVER_ERROR } = require("../../helper/status-codes");
const { globalPermissions } = require("../../models");
const { SERVER_ERROR_MESSAGE } = require("../../utils/constant");

const viewPermissions = async (req) => {
  try {
    const permissions = await globalPermissions.find({ status: "Active" });
    return { permissions: permissions };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

module.exports = {
  viewPermissions,
};
