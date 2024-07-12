const mongoose = require("mongoose");

const sysCode = new mongoose.Schema(
  {
    dropdownCode: {
      type: String,
      required: true,
      unique: true,
    },
    collectionName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive", "Deleted"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("sysCode", sysCode);
