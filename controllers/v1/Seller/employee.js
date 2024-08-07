const {
  addEmployee,
  sellerViewEmployees,
  sellerEditEmployee,
  sellerViewEmployeeById,
  sellerDeleteEmployee,
} = require("../../../service/v1");

const addEmployeeController = async (req, res, next) => {
  try {
    const response = await addEmployee(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const sellerViewEmployeesController = async (req, res, next) => {
  try {
    const response = await sellerViewEmployees(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const sellerViewEmployeeByIdController = async (req, res, next) => {
  try {
    const response = await sellerViewEmployeeById(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const sellerEditEmployeeController = async (req, res, next) => {
  try {
    const response = await sellerEditEmployee(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const sellerDeleteEmployeeController = async (req, res, next) => {
  try {
    const response = await sellerDeleteEmployee(req);
    return response;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addEmployeeController,
  sellerViewEmployeesController,
  sellerEditEmployeeController,
  sellerViewEmployeeByIdController,
  sellerDeleteEmployeeController,
};
