import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import morgan from "morgan";
import path from "path";
import { createServer } from "http";
import router from "./routes/wallet";

import { authenticateMiddleware } from "./middleware/authenticate";
import { errorMiddleware } from "./middleware/error";
import { checkDbConnection } from "./utils/prisma";
import { ErrorConstructor } from "./utils/reshelper";

// Initialize express app
const app = express();
const server = createServer(app);

// Environment variables and logging setup
const port = process.env.PORT || 3001;
const logsDirectory = "api-response.log";
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, ".", logsDirectory),
  { flags: "a" }
);

// Database connection check and scheduled job setup
checkDbConnection();

app.use(express.static(path.join(__dirname, "..", "dist")));

// Middleware setup
app.use(cors());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(morgan("dev"));
app.use(express.json());

app.use(errorMiddleware);

// Routes
app.use("/api/*", authenticateMiddleware);
app.use("/api/", router);

// Error handling for uncaught exceptions and unhandled promise rejections
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("warning", (warning) => {
  console.warn("Warning occurred:", warning.message);
  const warningLog = `Date: ${new Date().toISOString()}\nWarning: ${
    warning.stack
  }\n\n`;

  fs.appendFile("warning.log", warningLog, (err) => {
    if (err) {
      console.error("Error writing to warnings.log:", err);
    }
  });
});

// Fallback route for serving the main HTML file
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

app.use("/api/*", (req, res, next) => {
  const response = new ErrorConstructor(
    `Can't find ${req.method.toUpperCase()} ${req.originalUrl} on this server!`,
    false,
    404
  );
  res.status(response.statusCode).send(response);
});

// Start the server
server.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});
