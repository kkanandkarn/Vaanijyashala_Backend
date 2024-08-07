const {
  addEmployee,
  sellerViewEmployees,
  sellerEditEmployee,
  sellerViewEmployeeById,
  sellerDeleteEmployee,
} = require("./employee");
const {
  addProduct,
  sellerViewProducts,
  sellerViewProductById,
  sellerEditProduct,
  sellerDeleteProduct,
} = require("./product");
const {
  sellerProfile,
  sellerViewProfile,
  sellerEditProfile,
} = require("./seller");

module.exports = {
  sellerProfile,
  addEmployee,
  addProduct,
  sellerViewProducts,
  sellerViewProductById,
  sellerViewEmployees,
  sellerViewEmployeeById,
  sellerEditEmployee,
  sellerDeleteEmployee,
  sellerEditProduct,
  sellerDeleteProduct,
  sellerViewProfile,
  sellerEditProfile,
};
