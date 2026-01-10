import mongoose from "mongoose";

const connectDB = async () => {
    // try {
    //     mongoose.connection.on("connected", () => {
    //         console.log("MongoDB connected");
    //     });
    //     await mongoose.connect(`${process.env.MONGODB_URI}/rtc`);
    // } catch (error) {
    //     console.error(error);
    // }
    try {
    mongoose.connection.on("connected", () => {
      console.log("🟢 MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("🔴 MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("🟡 MongoDB disconnected");
    });

    await mongoose.connect(`${process.env.MONGODB_URI}/rtc`);

  } catch (error: any) {
    console.error("❌ MongoDB initial connection failed:", error.message);
    process.exit(1);
  }
}
export default connectDB;