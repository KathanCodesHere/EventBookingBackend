import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 2000 },
    date: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    location: {
      address: { type: String, trim: true },
      coordinates: {
        latitude: { type: String },
        longitude: { type: String },
      },
      street: { type: String, trim: true },
      landmark: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    images: [
      {
        type: String,
      },
    ],
    bannerImage: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
