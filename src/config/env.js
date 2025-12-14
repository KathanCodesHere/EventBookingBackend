import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dotenv.config({
//   path: path.join(__dirname, "../../.env.development"),
// });

//  STEP 1: Load env FIRST
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({
  path: path.resolve(process.cwd(), envFile),
});

console.log("ENV LOADED:", {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
});
