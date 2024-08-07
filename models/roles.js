const mongoose = require("mongoose");

const roles = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    permissions: [
      {
        type: mongoose.ObjectId,
        ref: "globalPermissions",
      },
    ],
    alias: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Private", "Inactive", "Deleted"],
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "userCrendentials",
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "userCrendentials",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("roles", roles);
