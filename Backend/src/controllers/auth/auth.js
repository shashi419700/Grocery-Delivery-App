import { use } from "react";
import { Customer, DeliveryPartner } from "../../models/user.js";

const genrateToken = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

export const loginCustomber = async (req, reply) => {
  try {
    const { phone } = req.body;
    let customer = await Customer.findOne({ phone });

    if (!customer) {
      customer = new Customer({ phone, role: "customer", isActivated: true });
      await customer.save();
    }

    const { accessToken, refreshToken } = genrateToken(customer);

    return reply.send({
      message: "Login successful",
      accessToken,
      refreshToken,
      customer,
    });
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "An error occurred during login." });
  }
};

export const loginDeliveryPartner = async (req, reply) => {
  try {
    const { email, password } = req.body;
    const deliveryPartner = await DeliveryPartner.findOne({ email });

    if (!deliveryPartner) {
      return reply.status(404).send({ message: "Delivery partner not found." });
    }

    const isMatch = password === deliveryPartner.password;

    if (!isMatch) {
      return reply.status(401).send({ message: "Invalid credentials." });
    }

    const { accessToken, refreshToken } = genrateToken(deliveryPartner);

    return reply.send({
      message: "Login successful",
      accessToken,
      refreshToken,
      deliveryPartner,
    });
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "An error occurred during login." });
  }
};

export const refreshToken = async (req, reply) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return reply.status(401).send({ message: "Refresh token is required." });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET);
    let user;

    if (decoded.role === "Customer") {
      user = await Customer.findById(decoded.userId);
    } else if (decoded.role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(decoded.userId);
    } else {
      return reply.status(403).send({ message: "Invalid user role." });
    }
  } catch (error) {
    return reply.status(403).send({ message: "Invalid Refresh token." });
  }
};

export const fetchUser = async (req, reply) => {
  try {
    const { userId, role } = req.user;
    let user;

    if (role === "Customer") {
      user = await Customer.findById(userId);
    } else if (role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(userId);
    } else {
      return reply.status(403).send({ message: "Invalid user role." });
    }

    if (!user) {
      return reply.status(404).send({ message: "User not found." });
    }

    return reply.send({ message: "User fetched successfully", user });
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "An error occurred while fetching user." });
  }
};
