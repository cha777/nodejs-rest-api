import mongoose from "mongoose";
import type { ConnectOptions } from "mongoose";
import debug from "debug";
import type { IDebugger } from "debug";

const log: IDebugger = debug("app:mongoose-service");

class MongooseService {
  private count = 0;
  private retrySeconds = 5;
  private mongooseOptions: ConnectOptions = {
    serverSelectionTimeoutMS: 5000,
  };

  constructor() {
    this.connectWithRetry();
  }

  getMongoose() {
    return mongoose;
  }

  connectWithRetry = () => {
    log("Attempting MongoDB connection (will retry if needed)");

    mongoose
      .connect("mongodb://localhost:27017/api-db", this.mongooseOptions)
      .then(() => {
        log("MongoDB is connected");
      })
      .catch((err) => {
        log(
          `MongoDB connection unsuccessful (will retry #${++this.count} after ${
            this.retrySeconds
          } seconds):`,
          err
        );

        setTimeout(this.connectWithRetry, this.retrySeconds * 1000);
      });
  };
}

export default new MongooseService();
