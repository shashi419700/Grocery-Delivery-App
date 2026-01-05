import "dotenv/config";
import fastify from "fastify";
import { connectDB } from "./src/config/connect.js";
import { PORT } from "./src/config/config.js";

const start = async () => {
  try {
    // 🔹 Connect to MongoDB
    await connectDB(process.env.MONGO_URI);

    const app = fastify({
      logger: true,
    });

    // 🔹 Start server (NO CALLBACK ❌)
    await app.listen({
      port: PORT,
      host: "0.0.0.0",
    });

    console.log(`Grocery App running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("Server failed to start ❌", error);
    process.exit(1);
  }
};

start();
