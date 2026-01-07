import "dotenv/config";
import fastify from "fastify";
import fastifySocketIO from "fastify-socket.io";
import dotenv  from "dotenv"
import { connectDB } from "./src/config/connect.js";
import { PORT } from "./src/config/config.js";
import { registerRoutes } from "./src/routes/index.js";

const start = async () => {
  try {
    // Connect MongoDB
    await connectDB(process.env.MONGO_URI);

    // Create Fastify app
    const app = fastify({ logger: true });

    // Register Socket.IO
    app.register(fastifySocketIO, {
      cors: {
        origin: "*",
      },
      pingInterval: 10000,
      pingTimeout: 5000,
      transports: ["websocket"],
    });

    //  Register API Routes
    await registerRoutes(app);

    //  Start Server
    await app.listen({
      port: PORT,
      host: "0.0.0.0",
    });

    console.log(`🛒 Grocery App running on http://localhost:${PORT}`);

    //  Socket.IO Events
    app.ready().then(() => {
      app.io.on("connection", (socket) => {
        console.log("✅ A User Connected");

        socket.on("joinRoom", (orderId) => {
          socket.join(orderId);
          console.log(`🔴 User Joined Room: ${orderId}`);
        });

        socket.on("disconnect", () => {
          console.log("❌ User Disconnected");
        });
      });
    });
  } catch (error) {
    console.error("❌ Server failed to start", error);
    process.exit(1);
  }
};

start();
