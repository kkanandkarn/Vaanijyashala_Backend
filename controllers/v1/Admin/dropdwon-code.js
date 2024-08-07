const { dropdownCode } = require("../../../service/v1");

const dropdwonCodeController = async (req, res, next) => {
  try {
    const response = await dropdownCode(req);
    return response;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  dropdwonCodeController,
};
