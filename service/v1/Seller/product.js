const { default: mongoose } = require("mongoose");
const { ErrorHandler } = require("../../../helper");
const {
  SERVER_ERROR,
  BAD_GATEWAY,
  NOT_FOUND,
  LOCKED,
} = require("../../../helper/status-codes");
const { product, userCredentials } = require("../../../models");
const { SERVER_ERROR_MESSAGE } = require("../../../utils/constant");
const { checkRequiredFields } = require("../../../utils/validations");
const cloudinary = require("cloudinary").v2;

const addProduct = async (req) => {
  try {
    const userId = req.user.userId;
    const findUser = await userCredentials.findOne({ _id: userId });
    const userStatus = findUser.status;
    if (userStatus === "Hold") {
      throw new ErrorHandler(
        LOCKED,
        "Your account is on hold. Cannot add new product."
      );
    }
    const {
      productName,
      productDesc,
      quantity,
      price,
      highlights = [],
    } = req.body;

    const fieldsToCheck = [
      { value: productName, error: "Product name is required" },
      { value: quantity, error: "Product description is required" },
      { value: price, error: "Product price is required" },
    ];

    const validationError = checkRequiredFields(fieldsToCheck);
    if (validationError) {
      throw new ErrorHandler(BAD_GATEWAY, validationError.error);
    }

    let ProductImages = [];
    if (req.files && req.files.productImages) {
      ProductImages = req.files.productImages;
    }

    const count = await product.countDocuments();
    const uniqueId = `VSP${100 + count}`;

    const newProduct = new product({
      tenantId: userId,
      uniqueId: uniqueId,
      productName: productName,
      productDesc: productDesc || "",
      totalQuantity: quantity,
      activeQuantity: quantity,
      price: price,
      highlights: highlights,
      productImages: ProductImages,
      createdBy: userId,
      updatedBy: userId,
    });

    await newProduct.save();

    return { message: "Product added successfully" };
  } catch (error) {
    if (req.files && req.files.productImages) {
      req.files.productImages.map(async (img) => {
        await cloudinary.uploader.destroy(img.filename, (err, result) => {
          if (err) {
            console.error("Error deleting file from Cloudinary:", err);
          } else {
            console.log("Deleted file from Cloudinary:", result);
          }
        });
      });
    }
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const sellerViewProducts = async (req) => {
  try {
    const userId = req.user.userId;

    let products = [];
    const { status } = req.body;
    if (!status || status === "") {
      throw new ErrorHandler(BAD_GATEWAY, "Status is required");
    }
    const allowedStatus = ["All", "Active", "Sold"];
    if (!allowedStatus.includes(status)) {
      throw new ErrorHandler(
        BAD_GATEWAY,
        `Invalid status. Allowed status: ${allowedStatus}`
      );
    }
    switch (status) {
      case "All":
        products = await product.find({
          tenantId: userId,
          status: { $ne: "Deleted" },
        });
        break;
      case "Active":
        products = await product.find({
          tenantId: userId,
          activeQuantity: { $ne: 0 },
          status: { $ne: "Deleted" },
        });
        break;
      case "Sold":
        products = await product.find({
          tenantId: userId,
          activeQuantity: 0,
          status: { $ne: "Deleted" },
        });
        break;

      default:
        throw new ErrorHandler(
          BAD_GATEWAY,
          `Invalid status. Allowed status: ${allowedStatus}`
        );
    }

    return { products: products };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};
const sellerViewProductById = async (req) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const productData = await product.findOne({
      tenantId: userId,
      _id: id,
      status: { $ne: "Deleted" },
    });
    return { productData: productData };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const sellerEditProduct = async (req) => {
  try {
    const userId = req.user.userId;
    const findUser = await userCredentials.findOne({ _id: userId });
    const userStatus = findUser.status;
    if (userStatus === "Hold") {
      throw new ErrorHandler(
        LOCKED,
        "Your account is on hold. Cannot edit product."
      );
    }
    const {
      productName,
      productDesc,
      quantity,
      price,
      highlights = [],
    } = req.body;

    const { id } = req.params;

    const fieldsToCheck = [
      { value: productName, error: "Product name is required" },
      { value: quantity, error: "Product description is required" },
      { value: price, error: "Product price is required" },
    ];

    const validationError = checkRequiredFields(fieldsToCheck);
    if (validationError) {
      throw new ErrorHandler(BAD_GATEWAY, validationError.error);
    }

    const checkProduct = await product.findOne({
      _id: id,
      status: { $ne: "Deleted" },
      tenantId: userId,
    });
    if (!checkProduct) {
      throw new ErrorHandler(NOT_FOUND, "Product not found.");
    }

    let ProductImages = [];

    await Promise.all(
      checkProduct.productImages.map(async (img) => {
        await cloudinary.uploader.destroy(img.filename, (err, result) => {
          if (err) {
            console.error("Error deleting file from Cloudinary:", err);
          } else {
            console.log("Deleted file from Cloudinary:", result);
          }
        });
      })
    );

    if (req.files && req.files.productImages) {
      ProductImages = req.files.productImages;
    }

    await product.findByIdAndUpdate(id, {
      productName: productName,
      productDesc: productDesc || checkProduct.productDesc,
      totalQuantity: quantity,
      activeQuantity: quantity,
      price: price,
      highlights: highlights,
      productImages: ProductImages,
      updatedBy: userId,
      updatedAt: new Date(),
    });

    return { message: "Product updated successfully" };
  } catch (error) {
    if (req.files && req.files.productImages) {
      req.files.productImages.map(async (img) => {
        await cloudinary.uploader.destroy(img.filename, (err, result) => {
          if (err) {
            console.error("Error deleting file from Cloudinary:", err);
          } else {
            console.log("Deleted file from Cloudinary:", result);
          }
        });
      });
    }
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const sellerDeleteProduct = async (req) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { ids = [] } = req.body;
    const userId = req.user.userId;
    const findUser = await userCredentials.findOne({ _id: userId });
    const userStatus = findUser.status;
    if (userStatus === "Hold") {
      throw new ErrorHandler(
        LOCKED,
        "Your account is on hold. Cannot delete product."
      );
    }
    if (!ids.length) {
      throw new ErrorHandler(BAD_GATEWAY, "ids are required");
    }
    await Promise.all(
      await ids.map(async (id) => {
        const checkProduct = await product.findOne({
          _id: id,
          status: { $ne: "Deleted" },
          tenantId: userId,
        });
        if (!checkProduct) {
          throw new ErrorHandler(NOT_FOUND, `Product ${id} not found.`);
        }
        await product
          .findByIdAndUpdate(id, {
            status: "Deleted",
            updatedBy: userId,
            updatedAt: new Date(),
          })
          .session(session);
      })
    );

    await session.commitTransaction();
    session.endSession();
    return { message: "Product(s) deleted successfully." };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

module.exports = {
  addProduct,
  sellerViewProducts,
  sellerViewProductById,
  sellerEditProduct,
  sellerDeleteProduct,
};
