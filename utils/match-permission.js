const { roles, globalPermissions } = require("../models");
const { FAILURE } = require("./constant");

const matchPermission = async (req, role, perm) => {
  try {
    if (!req.user.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "Unauthorized");
    }
    const fetchRole = await roles.findOne({ title: role, status: "Active" });
    if (!fetchRole) {
      res.status(401).json({
        status: FAILURE,
        statusCode: 401,
        message: "Role deleted. Kindly contact to administrator.",
      });
    }
    const roleId = fetchRole._id;
    const fetchPerm = await globalPermissions.findOne({ permissionName: perm });
    if (!fetchPerm) {
      res.status(401).json({
        status: FAILURE,
        statusCode: 401,
        message: "Permission deleted. Kindly contact to administrator.",
      });
    }
    const permissionId = fetchPerm._id;
    console.log("role id: ", roleId);
    console.log("permission id: ", permissionId);
    console.log("role: ", fetchRole);
    if (fetchRole.permissions.includes(permissionId)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

module.exports = {
  matchPermission,
};
