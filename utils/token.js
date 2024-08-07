const jwt = require("jsonwebtoken");
const users = require("../helper/users");

const { USER } = users;

module.exports = function (id, role) {
  return jwt.sign({ userId: id, role }, process.env.JWT_PRIVATE_KEY);
};
