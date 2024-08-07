const { statusCodes, ErrorHandler, casbinEnforcer } = require("../helper");
const { FORBIDDEN } = require("../helper/status-codes");
const { userCredentials } = require("../models");
const { constant, camelize } = require("../utils");
const { matchPermission } = require("../utils/match-permission");

const { OK, UNAUTHORIZED } = statusCodes;
const { SUCCESS } = constant;

/**
 *
 * The dispacter function middleware is the single source for sending the response. This middleware
 * checks if the user is authenticated and if the allowed user has access to the controller.
 *
 * @param {*} req -> Express request object
 * @param {*} res -> Express response object
 * @param {*} next -> Express middleware next function
 * @param {*} func -> Router controller function
 * @param resource -> Resource to Check Permission On
 * @param {*} perm -> Permission to Check
 * @returns -> The final response with the data
 */

const dispatcher = async (req, res, next, func, perm) => {
  try {
    const { user } = req;
    let userStatus = null;

    if (perm) {
      const checkPerm = await matchPermission(req, user.role, perm);
      if (!checkPerm) throw new ErrorHandler(UNAUTHORIZED, "Not permitted");
    }
    if (user) {
      const userId = req.user.userId;
      const findUser = await userCredentials.findOne({ _id: userId });
      userStatus = findUser.status;
      if (userStatus === "Suspended" || userStatus === "Deleted") {
        throw new ErrorHandler(
          FORBIDDEN,
          "Your account is suspended. Contact us for further information."
        );
      }
    }

    const data = await func(req, res, next);

    if (data != null) {
      const camelData = await camelize(data);
      return res.status(OK).json({
        status: SUCCESS,
        userStatus: userStatus,
        statusCode: 200,
        data: camelData,
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = dispatcher;
