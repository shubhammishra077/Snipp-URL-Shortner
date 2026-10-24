import mongoose from "mongoose";

const DEFAULT_DB_NAME = "url-shortner";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("FATAL: MONGO_URI is not set in your .env file");
    process.exit(1);
  }

  // Guard against a common copy-paste mistake: pasting an Atlas connection
  // string that already ends in "/" and then appending a db name after it,
  // e.g. ".../?retryWrites=true" -> ".../url-shortner/?retryWrites=true"
  // This produces a namespace like "/url-shortner.users" which Mongo rejects.
  if (/\/\/[^/]+\/\//.test(uri) || uri.includes("//?")) {
    console.error(
      "FATAL: MONGO_URI looks malformed (double slash before the database name).\n" +
      "  Use the database name via MONGO_DB_NAME instead of editing the URI path, e.g.:\n" +
      "  MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority\n" +
      "  MONGO_DB_NAME=url-shortner"
    );
    process.exit(1);
  }

  try {
    // dbName is set explicitly here rather than relying on the URI's path
    // segment, so a stray slash or a URI that omits the db name entirely
    // (common when pasting straight from Atlas) can't silently break writes.
    const conn = await mongoose.connect(uri, {
      dbName: process.env.MONGO_DB_NAME || DEFAULT_DB_NAME,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
