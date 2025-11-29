import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true }, // UUID encoded in QR
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: ["booked", "cancelled", "refunded"],
    default: "booked",
  },
  isScanned: { type: Boolean, default: false },
  scannedAt: { type: Date },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // staff who scanned
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Ticket", ticketSchema);
