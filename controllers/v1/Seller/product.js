const {
  addProduct,
  sellerViewProducts,
  sellerViewProductById,
  sellerEditProduct,
  sellerDeleteProduct,
} = require("../../../service/v1");

const addProductController = async (req, res, next) => {
  try {
    const response = await addProduct(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const sellerViewProductsController = async (req, res, next) => {
  try {
    const response = await sellerViewProducts(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const sellerViewProductByIdController = async (req, res, next) => {
  try {
    const response = await sellerViewProductById(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const sellerEditProductController = async (req, res, next) => {
  try {
    const response = await sellerEditProduct(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const sellerDeleteProductController = async (req, res, next) => {
  try {
    const response = await sellerDeleteProduct(req);
    return response;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addProductController,
  sellerViewProductsController,
  sellerViewProductByIdController,
  sellerEditProductController,
  sellerDeleteProductController,
};
