const mongoose = require("mongoose");

const dropdownQuerySchema = new mongoose.Schema({
  dropdown_code: { type: String, required: true, unique: true },
  query: { type: String, required: true },
  conditions: { type: String },
  order_by: { type: String },
  status: { type: String, default: "Active" },
});

const DropdownQuery = mongoose.model("DropdownQuery", dropdownQuerySchema);

module.exports = DropdownQuery;
