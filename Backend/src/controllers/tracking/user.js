import { DeliveryPartner, Customer } from "../../models/index.js";

export const updateUser = async (req, reply) => {
  try {
    const { userId, role } = req.user;
    const updateData = req.body;

    let UserModel;

    if (role === "Customer") {
      UserModel = Customer;
    } else if (role === "DeliveryPartner") {
      UserModel = DeliveryPartner;
    } else {
      return reply.status(400).send({
        message: "Invalid user role",
      });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return reply.status(404).send({
        message: "User not found",
      });
    }

    return reply.send({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return reply.status(500).send({
      message: "Failed to update user",
      error: error.message,
    });
  }
};
