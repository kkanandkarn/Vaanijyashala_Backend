const mongoose = require("mongoose");

const globalPermissions = new mongoose.Schema(
  {
    permissionName: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive", "Deleted"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("globalPermissions", globalPermissions);
