const mongoose = require("mongoose");

const userCrendentials = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: mongoose.Schema.ObjectId,
      ref: "roles",
    },
    isLogin: {
      type: Boolean,
      default: true,
    },
    referralCode: {
      type: String,
    },
    referredUsers: {
      type: Number,
      default: 0,
    },
    parentId: {
      type: mongoose.ObjectId,
      ref: "userCrendentials",
    },
    isAgreeTermsCondition: {
      type: Boolean,
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Hold", "Suspended", "Deleted"],
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

module.exports = mongoose.model("userCrendentials", userCrendentials);
