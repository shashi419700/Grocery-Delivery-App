import Order from "../../models/order.js";
import Branch from "../../models/branch.js";
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
