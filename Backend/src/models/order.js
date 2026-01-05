import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
  },
  customber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliveryPartner",
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
  },
  items: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
      },
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
      },
      count: { type: Number, required: true },
    },
  ],
  deliveryLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
  },
  pickLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
  },
  deliveryPersonLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
  },
  status: {
    type: String,
    enum: ["available", "Confirmed", "arriving", "delivered", "cancelled"],
    default: "available",
  },
});

async function getNextSequenceValue(sequenceName) {
  try {
    const sequenceDocument = await Counter.findOneAndUpdate(
      { name: sequenceName },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );

    return sequenceDocument.sequence_value;
  } catch (error) {
    throw new Error("Failed to generate sequence value");
  }
}
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const sequenceValue = await getNextSequenceValue("orderId");
    this.orderId = `ORDR-${sequenceValue.toString().padStart(5, "0")}`;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
