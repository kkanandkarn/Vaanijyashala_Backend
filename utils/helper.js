// const camelcaseKeys = require("camelcase-keys");
// const camelcaseKeys = import("camelcase-keys");

const zeroPad = (num, places) => String(num).padStart(places, "0");

const { getDate } = require("./time");
const { ErrorHandler } = require("../helper");

module.exports = {
  camelize: async (obj) => {
    try {
      const camelcaseKeys = (await import("camelcase-keys")).default;
      return camelcaseKeys(JSON.parse(JSON.stringify(obj)), { deep: true });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
