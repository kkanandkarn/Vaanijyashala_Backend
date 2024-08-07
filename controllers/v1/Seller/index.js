const {
  addEmployeeController,
  sellerViewEmployeesController,
  sellerEditEmployeeController,
  sellerViewEmployeeByIdController,
  sellerDeleteEmployeeController,
} = require("./employee");
const {
  addProductController,
  sellerViewProductsController,
  sellerViewProductByIdController,
  sellerEditProductController,
  sellerDeleteProductController,
} = require("./product");
const {
  sellerProfileController,
  sellerViewProfileController,
  sellerEditProfileController,
} = require("./seller");

module.exports = {
  sellerProfileController,
  addEmployeeController,
  addProductController,
  sellerViewProductsController,
  sellerViewProductByIdController,
  sellerViewEmployeesController,
  sellerViewEmployeeByIdController,
  sellerEditEmployeeController,
  sellerDeleteEmployeeController,
  sellerEditProductController,
  sellerDeleteProductController,
  sellerViewProfileController,
  sellerEditProfileController,
};
