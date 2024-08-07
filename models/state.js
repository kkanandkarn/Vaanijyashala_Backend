const mongoose = require("mongoose");

const state = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    districts: [
      {
        _id: {
          type: mongoose.ObjectId,
          auto: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
    ],
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

module.exports = mongoose.model("state", state);
