import {
  conformOrder,
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from "../controllers/order/order.js";
import { verifyToken } from "../middleware/auth.js";

export const orderRoutes = async (fastify, options) => {
  fastify.addHook("preHandler", async (req, reply) => {
    const Authenticated = await verifyToken(request, reply);
    if (!Authenticated) {
      return reply.code(401).send({ message: "Unauthorized" });
    }
  });

  fastify.post("/order", createOrder);
  fastify.get("/order", getOrders);
  fastify.patch("/order/:orderId/status", updateOrderStatus);
  fastify.patch("/order/:orderId/conform", conformOrder);
  fastify.patch("/order/:orderId", getOrderById);
};
