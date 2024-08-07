const {
  addState,
  viewStates,
  editState,
  deleteState,
} = require("../../../service/v1");

const addStateController = async (req, res, next) => {
  try {
    const response = await addState(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const viewStatesController = async (req, res, next) => {
  try {
    const response = await viewStates(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const editStateController = async (req, res, next) => {
  try {
    const response = await editState(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const deleteStateController = async (req, res, next) => {
  try {
    const response = await deleteState(req);
    return response;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addStateController,
  viewStatesController,
  editStateController,
  deleteStateController,
};
