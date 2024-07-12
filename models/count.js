const mongoose = require("mongoose");

const count = new mongoose.Schema(
  {
    usersCount: {
      type: Number,
      default: 0,
    },
    adminCount: {
      type: Number,
      default: 0,
    },
    representativeCount: {
      type: Number,
      default: 0,
    },
    sellerCount: {
      type: Number,
      default: 0,
    },
    productCount: {
      type: Number,
      default: 0,
    },
    localProductCount: {
      type: Number,
      default: 0,
    },
    globalProductCount: {
      type: Number,
      default: 0,
    },
    EmployeeCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive", "Deleted"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("count", count);
