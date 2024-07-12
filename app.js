const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");

require("dotenv").config();
require("moment-timezone")().tz("Asia/Kolkata");

const { validator, validateToken, handleError } = require("./middleware");

const { v1 } = require("./routes");

const { morganLogger } = require("./middleware/logger");
const connectDB = require("./config/db");
const {
  count,
  district,
  gender,
  otpCount,
  otp,
  roles,
  seller,
  shopType,
  state,
  userCredentials,
  session,
  sysCode,
} = require("./models");

const app = express();
// database config
connectDB();

app.use("/", express.static(path.join(__dirname, "../public")));

app
  .use(morganLogger)
  .use(cors())
  .use(helmet())
  .use(
    bodyParser.urlencoded({
      limit: "100mb",
      extended: true,
      parameterLimit: 50000,
    })
  )
  .use(bodyParser.json({ limit: "100mb" }))
  .use(express.static(path.join(__dirname, "public")));

app.use("/api/v1", v1);

app.use((err, req, res, next) => {
  handleError(err, res);
});

app.use(
  count,
  district,
  gender,
  otpCount,
  otp,
  roles,
  seller,
  shopType,
  state,
  userCredentials,
  session,
  sysCode
);
console.log("Collection Created");

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server is running on ${process.env.DEV_URL}`);
});
