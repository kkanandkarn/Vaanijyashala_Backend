const mongoose = require("mongoose");

const shopCategory = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
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

module.exports = mongoose.model("shopCategory", shopCategory);
