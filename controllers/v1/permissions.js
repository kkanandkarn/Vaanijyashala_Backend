const { viewPermissions } = require("../../service/v1");

const viewPermissionsController = async (req, res, next) => {
  try {
    const response = await viewPermissions(req);
    return response;
  } catch (error) {
    next(error);
  }
};

module.exports = {
    viewPermissionsController
}
