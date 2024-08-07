const mongoose = require("mongoose");

const Product = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.ObjectId,
      ref: "userCrendentials",
    },
    uniqueId: {
      type: String,
    },
    productName: {
      type: String,
      required: true,
    },
    productDesc: {
      type: String,
    },
    totalQuantity: {
      type: Number,
      required: true,
    },
    activeQuantity: {
      type: Number,
      required: true,
    },
    soldQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    highlights: {
      type: [String],
    },
    productImages: [
      {
        fieldname: String,
        originalname: String,
        encoding: String,
        mimetype: String,
        path: String,
        size: String,
        filename: String,
      },
    ],

    productType: {
      type: String,
      enum: ["local", "global"],
      default: "local",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Deleted"],
      default: "Active",
    },

    createdBy: {
      type: mongoose.ObjectId,
      ref: "userCrendentials",
    },
    updatedBy: {
      type: mongoose.ObjectId,
      ref: "userCrendentials",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", Product);
