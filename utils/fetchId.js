const { ErrorHandler } = require("../helper");
const { SERVER_ERROR } = require("../helper/status-codes");
const { roles } = require("../models");
const { SERVER_ERROR_MESSAGE } = require("./constant");

const fetchRoleId = async (roleName) => {
  try {
    const role = await roles.findOne({ title: roleName });
    return role.id;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

module.exports = {
  fetchRoleId,
};