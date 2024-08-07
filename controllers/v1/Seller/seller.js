const {
  sellerProfile,
  sellerViewProfile,
  sellerEditProfile,
} = require("../../../service/v1");

const sellerProfileController = async (req, res, next) => {
  try {
    const response = await sellerProfile(req);
    return response;
  } catch (error) {
    next(error);
  }
};

const sellerViewProfileController = async (req, res, next) => {
  try {
    const response = await sellerViewProfile(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const sellerEditProfileController = async (req, res, next) => {
  try {
    const response = await sellerEditProfile(req);
    return response;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sellerProfileController,
  sellerViewProfileController,
  sellerEditProfileController,
};
