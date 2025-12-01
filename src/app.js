import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//import routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import organizerRoutes from "./routes/organizerRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookTicketRoutes from "./routes/bookTicketRoutes.js";
import scannerRoutes from "./routes/scannerRoutes.js";
import ticketCheckerRoutes from "./routes/ticketCheckerRoutes.js";
const app = express();

/*Middlewares*/

// Parse incoming JSON data
app.use(express.json());

// Parse URL encoded form data
app.use(express.urlencoded({ extended: true }));

// Parse cookies from browser
app.use(cookieParser());

// CORS setup (frontend URL ko allow)
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ticket", bookTicketRoutes);
app.use("/api/scanner", scannerRoutes);
app.use("/api/ticketChecker", ticketCheckerRoutes);

/*Health Check
Ye route check karta hai ki server sahi se chal raha hai ya nahi.
*/
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

/* 404 Not Found
Agar koi route exist nahi karta to ye fallback use hota hai.
*/
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    timestamp: new Date().toISOString(),
  });
});

/*Global Error Handler
Agar koi error application me throw hota hai, to ye handler usko catch karta hai
aur user ko clean response deta hai. 
 This prevents server crash.
*/
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

export default app;
