const {
  addDistrict,
  editDistrict,
  viewDistrict,
  deleteDistrict,
} = require("../../../service/v1");

const addDistrictController = async (req, res, next) => {
  try {
    const response = await addDistrict(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const editDistrictController = async (req, res, next) => {
  try {
    const response = await editDistrict(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const viewDistrictController = async (req, res, next) => {
  try {
    const response = await viewDistrict(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const deleteDistrictController = async (req, res, next) => {
  try {
    const response = await deleteDistrict(req);
    return response;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addDistrictController,
  editDistrictController,
  viewDistrictController,
  deleteDistrictController,
};
