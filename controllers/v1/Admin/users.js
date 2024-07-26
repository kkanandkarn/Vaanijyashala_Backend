const {
  viewUsers,
  createUser,
  editUser,
  deleteUser,
  changeUserStatus,
} = require("../../../service/v1");

const createUserController = async (req, res, next) => {
  try {
    const response = await createUser(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const viewUsersController = async (req, res, next) => {
  try {
    const response = await viewUsers(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const editUserController = async (req, res, next) => {
  try {
    const response = await editUser(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const deleteUserController = async (req, res, next) => {
  try {
    const response = await deleteUser(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const changeUserStatusController = async (req, res, next) => {
  try {
    const response = await changeUserStatus(req);
    return response;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  viewUsersController,
  createUserController,
  editUserController,
  deleteUserController,
  changeUserStatusController,
};
