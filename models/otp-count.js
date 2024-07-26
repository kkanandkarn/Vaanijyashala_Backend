const mongoose = require("mongoose");

const otpCount = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otpCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive", "Deleted"],
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

module.exports = mongoose.model("otpCount", otpCount);
