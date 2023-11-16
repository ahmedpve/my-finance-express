import dotenv from "dotenv";
import mongoose from "mongoose";

/* Register a listener for the uncaughtException process event (synchronous error) before any code */
process.on("uncaughtException", function (err) {
  console.log("🛑 uncaughtException:\n", err);
  process.exit(1);
});

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
/* Import app after configuring dotenv */
import app from "./app";

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started and listening on port ${process.env.PORT}.`)
);

const dbUri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?${process.env.DB_OPTIONS}`;

const connectToDb = async () => {
  try {
    const connection = await mongoose.connect(dbUri);
    console.log(`Connected to ${connection.connections[0].name} database.`);
  } catch (error) {
    console.log("🛑 Error connecting to database.", "\n", error);
    server.close(() => process.exit(1));
  }
};

connectToDb();

/* Register a listener for the unhandledRejection process event (asynchronous error) */
process.on("unhandledRejection", function (err) {
  console.log("🛑 unhandledRejection:\n", err);
  server.close(() => process.exit(1));
});
