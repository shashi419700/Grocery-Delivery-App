import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  address: { type: String },
  delivaryPartners: [
    { type: mongoose.Schema.Types.ObjectId, ref: "DelivaryPartner" },
  ],
});

export const Branch = mongoose.model("Branch", branchSchema);
