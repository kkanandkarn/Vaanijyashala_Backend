const mongoose = require("mongoose");

const Employee = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.ObjectId,
      ref: "userCrendentials",
    },
    userId: {
      type: mongoose.ObjectId,
      ref: "userCrendentials",
    },

    profileImg: {
      type: String,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: mongoose.ObjectId,
      ref: "gender",
    },
    mobileNumber: {
      type: String,
    },
    altMobileNumber: {
      type: String,
    },
    addressLine1: {
      type: String,
      required: true,
    },
    state: {
      type: mongoose.ObjectId,
      ref: "state",
      required: true,
    },
    district: {
      type: mongoose.ObjectId,
      ref: "district",
    },
    permissions: [
      {
        type: mongoose.ObjectId,
        ref: "globalPermissions",
      },
    ],
    idFile: {
      type: String,
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Hold", "Suspended", "Inactive", "Deleted"],
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

module.exports = mongoose.model("Employee", Employee);
