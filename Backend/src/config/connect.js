import mongoose from "mongoose";


export const connectDB = async (uri) => {
    try{
        await mongoose.connect(uri);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }

}