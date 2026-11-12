import "colors";
import mongoose from "mongoose";

export const dbConnection = async (): Promise<void> => {
  try {
    const connectionString = process.env.MONGODB_CNN;

    if (!connectionString) {
      throw new Error("MONGODB_CNN is not defined");
    }

    await mongoose.connect(connectionString);

    console.log("DB Online".rainbow);
  } catch (error) {
    console.error(error);
    throw new Error(`Error connecting to the database: ${error}`);
  }
};
