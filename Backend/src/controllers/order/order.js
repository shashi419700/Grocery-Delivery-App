import Branch from "../../models/branch.js";
import Order from "../../models/order.js";
import { Customer, DeliveryPartner } from "../../models/user.js";

// Create Order function
export const createOrder = async (req, reply) => {
  try {
    const { userId } = req.user;
    const { items, branch, totalPrice } = req.body;

    const customerdata = await Customer.findById(userId);
    const branchData = await Branch.findById(branch);

    if (customerdata) {
      return reply.status(404).send({ message: "Customer not found" });
    }

    const newOrder = new Order({
      customber: userId,
      items: items.map((item) => ({
        id: item.id,
        item: item.item,
        count: item.count,
      })),
      branch,
      totalPrice,
      deliveryLocation: {
        latitude: customerdata.liveLocation.latitude,
        longitude: customerdata.liveLocation.longitude,
        address: customerdata.address || "No address available",
      },
      pickLocation: {
        latitude: branchData.liveLocation.latitude,
        longitude: branchData.liveLocation.longitude,
        address: branchData.address || "No address available",
      },
    });

    const savedOrder = await newOrder.save();
    return reply.status(201).send(savedOrder);
  } catch (error) {
    console.log(error);
    return reply.status(500).send({ message: "Faild to create order", error });
  }
};

// Conform Order
export const conformOrder = async (req, reply) => {
  try {
    const { OrderId } = req.params;
    const { userId } = req.user;
    const { deliveryPersonLocation } = req.body;

    const deliveryPerson = await DeliveryPartner.findById(userId);
    if (!deliveryPerson) {
      return reply
        .status(404)
        .send({ message: "Delivery Person not found", error });
    }
    const order = await Order.findById(OrderId);

    if (!order) {
      return reply
        .status(404)
        .send({ message: "Order Person not found", error });
    }

    if (order.status !== "available") {
      return reply
        .status(400)
        .send({ message: "Order is not available", error });
    }

    order.status = "confirmed";

    order.deliveryPartner = userId;
    order.deliveryPersonLocation = {
      latitude: deliveryPersonLocation?.latitude,
      longitude: deliveryPersonLocation?.longitude,
      address: deliveryPersonLocation.address || "",
    };

    req.server.io.to(OrderId).emit("orderConformed", order);
    await order.save();

    return reply.send(order);
  } catch (error) {
    return reply.status(500).send({ message: "Faild to conform order", error });
  }
};

// Update Order
export const updateOrderStatus = async (req, reply) => {
  try {
    const { OrderId } = req.params;
    const { status, deliveryPersonLocation } = req.body;
    const { userId } = req.user;

    const deliveryPerson = await DeliveryPartner.findById(userId);
    if (!deliveryPerson) {
      return reply
        .status(404)
        .send({ message: "Delivery Person not found", error });
    }

    const order = await Order.findById(OrderId);

    if (!order) {
      return reply
        .status(404)
        .send({ message: "Order Person not found", error });
    }

    if (["cancelled", "delivered"].includes(order.status)) {
      return reply.status(400).send({ message: "Order cannot be updated" });
    }
    if (order.deliveryPartner.toString() !== userId) {
      return reply.status(403).send({ message: "Unathorised" });
    }

    order.status = status;
    order.deliveryPersonLocation = deliveryPersonLocation;
    await order.save();

    req.server.io.to(OrderId).emit("liveTrackingUpdates", order);

    return reply.send(order);
  } catch (error) {
    return reply.status
      .send(500)
      .send({ message: "Failed to update order status", error });
  }
};

// Get Orders
export const getOrders = async (req, reply) => {
  try {
    const { status, customberId, deliveryPartnerId, branchId } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }
    if (customberId) {
      query.customber = customberId;
    }
    if (deliveryPartnerId) {
      query.deliveryPartner = deliveryPartnerId;
      query.branch = branchId;
    }

    const orders = await Order.find(query).populate(
      "customber branch items.item deliveryPartner"
    );

    return reply.send(orders);
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "Faild to retrieve orders", error });
  }
};

// Get Single Orders
export const getOrderById = async (req, reply) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate(
      "customber branch items.item deliveryParter"
    );

    if (!order) {
      return reply.status.send(404).send({ message: "Order not found" });
    }
    return reply.send(order);
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "Faild to retrieve order", error });
  }
};
