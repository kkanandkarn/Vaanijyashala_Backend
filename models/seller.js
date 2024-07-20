const mongoose = require("mongoose");

const Seller = new mongoose.Schema(
  {
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
    shopLocality: {
      type: String,
      required: true,
    },
    shopCategory: {
      type: mongoose.ObjectId,
      ref: "shopCategory",
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
      require: true,
    },
    pinCode: {
      type: String,
      required: true,
    },
    gstNo: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Seller", Seller);
