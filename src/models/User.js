import mongoose from "mongoose";

// ORGANIZER DETAILS (only if role = organizer)
const organizerSchema = new mongoose.Schema(
  {
    email: String,
    mobile: String,
    organizerRequest: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reason: String, // optional reason for rejection
  },
  { _id: false }
);

// TICKET CHECKER DETAILS (only if role = ticketChecker)
const ticketCheckerSchema = new mongoose.Schema(
  {
    assignedByOrganizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "blocked"],
      default: "pending",
    },
  },
  { _id: false }
);

//
// MAIN USER SCHEMA (single schema for all roles)
//
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 30,
      required: [true, "Username is required"],
      unique: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      required: [true, "Email is required"],
    },

    mobile: {
      type: String,
      unique: true,
      trim: true,
      match: [/^[0-9]{10,15}$/, "Please enter a valid mobile number"],
      required: [true, "Mobile number is required"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // important → do not return password
    },

    // Supported roles in event booking system
    role: {
      type: String,
      enum: ["admin", "user", "organizer", "ticketChecker"],
      default: "user",
    },

    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    lastLogin: Date,

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],

    // Role-based additional info
    organizerInfo: organizerSchema,
    ticketCheckerInfo: ticketCheckerSchema,

    // Optional fields
    profileImage: String,
    address: String,
    city: String,

    // Tokens
    refreshToken: String,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
