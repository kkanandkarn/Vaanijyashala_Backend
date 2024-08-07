const { ErrorHandler } = require("../../../helper");
const { SERVER_ERROR } = require("../../../helper/status-codes");
const { SERVER_ERROR_MESSAGE } = require("../../../utils/constant");

const userReport = async (req) => {
  try {
    const roleCounts = await UserCrendentials.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "roles", // Name of the roles collection
          localField: "_id",
          foreignField: "_id",
          as: "roleDetails",
        },
      },
      {
        $unwind: "$roleDetails",
      },
      {
        $project: {
          role: "$roleDetails.name",
          count: 1,
        },
      },
    ]);

    roleCounts.forEach((roleCount) => {
      console.log(`${roleCount.role} role has ${roleCount.count} users`);
    });
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};
