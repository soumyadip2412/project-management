import mongoose from "mongoose"
import logger from "../utils/logger.js"

// mongoose.connect(process.env.MONGO_URL)

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/projmanage";
    try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        logger.info("✅ MongoDB connected successfully");
    } catch (error) {
        logger.warn("⚠️ Remote MongoDB connection failed, attempting local MongoDB...", error.message);
        try {
            await mongoose.connect("mongodb://127.0.0.1:27017/projmanage");
            logger.info("✅ Local MongoDB connected successfully");
        } catch (localErr) {
            logger.error("❌ Both Remote and Local MongoDB connections failed", localErr);
            process.exit(1);
        }
    }
}
export default connectDB