const mongoose = require("mongoose");

const roles = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    permissions: [
      {
        type: mongoose.ObjectId,
        ref: "globalPermissions",
      },
    ],
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive", "Deleted"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("roles", roles);
