import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//import routes
import authRoutes from "./routes/authRoutes.js";
import adminUserRoutes from "./routes/admin/adminUserRoutes.js";
import adminOrganizerRoutes from "./routes/admin/adminOrgnizerRoutes.js";
import organizerRoutes from "./routes/organizer/organizerRoutes.js";

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

//admin routes
app.use("/api/admin", adminUserRoutes);
app.use("/api/admin", adminOrganizerRoutes);

//organizer routes
app.use("/api/organizer", organizerRoutes);

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
