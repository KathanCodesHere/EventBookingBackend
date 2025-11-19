import path from "path";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";

//Load Environment Variables Based on NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || "development"}`;

// .env file load karna
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const PORT = process.env.PORT || 5000;

// Database connect
connectDB();

//start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
