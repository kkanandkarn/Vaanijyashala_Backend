const { dropdown } = require("../../service/v1");

const dropdownController = async (req, res, next) => {
  try {
    const response = await dropdown(req);
    return response;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  dropdownController,
};
