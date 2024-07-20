const { register, login, getUserByToken } = require("../../service/v1");

const registerController = async (req, res, next) => {
  try {
    const response = await register(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const loginController = async (req, res, next) => {
  try {
    const response = await login(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const getUserByTokenController = async (req, res, next) => {
  try {
    const response = await getUserByToken(req);
    return response;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerController,
  loginController,
  getUserByTokenController,
};
