import express, { json, urlencoded } from "express";
import createError from "http-errors";

import cookieParser from "cookie-parser";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import cors from "cors";
import dbConnect from "./src/config/dbConnect.js";
// import error middleware
import errorHandler from "./src/middleware/error.middleware.js";
// import routes
import AssignmentRoute from "./src/routes/assignment.route.js";
import QuestionRoute from "./src/routes/question.route.js";
import SubmissionRoute from "./src/routes/submission.route.js";
import UsersRoute from "./src/routes/user.route.js";
import protect from "./src/middleware/auth.middleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

// connect to mongodb
async function startServer() {
  await dbConnect();
  // other server setup code
}
startServer();

// middleware
app.use(cors()); // allow

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

// routes
app.use("/api/assignments", AssignmentRoute);
app.use("/api/questions", protect, QuestionRoute);
app.use("/api/submissions", protect, SubmissionRoute);
app.use("/api/users", UsersRoute);

// error middleware
app.use(errorHandler);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(500);
  res.render("error!");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.listen(PORT, () =>
  console.log(`app running on port http://localhost:${PORT}`)
);
