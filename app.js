/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const { sequelize } = require("./models/index");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const cors = require("cors");
// const AdminBro = require("admin-bro");
// const AdminBroExpress = require("@admin-bro/express");
// const AdminBroSequelize = require("@admin-bro/sequelize");

require("dotenv").config();

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

// declare a new express app
const app = express();
// AdminBro.registerAdapter(AdminBroSequelize);
// const db = require("./models");
// const adminBro = new AdminBro({
//   databases: [db],
//   rootPath: "/admin",
// });
// const router = AdminBroExpress.buildRouter(adminBro);
// app.use(adminBro.options.rootPath, router);

app.use(bodyParser.json({ limit: "5mb", extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext());

app.use(cors(corsOptions));
app.use(helmet());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(fileUpload());

const merchantRouter = require("./routes/merchant");
const userRouter = require("./routes/user");

app.use("/merchant", merchantRouter);
app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Hello World!",
  });
});

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});
app.use((error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    success: false,
    message: error.message,
  });
});

app.listen(process.env.PORT, async function () {
  console.log("App started");
  // console.log(`AdminBro is under localhost:${process.env.PORT}/admin`);
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
