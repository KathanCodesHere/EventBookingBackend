import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary Loaded:", {
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  keyExists: !!process.env.CLOUDINARY_API_KEY,
});

export default cloudinary;

// import { v2 as cloudinary } from "cloudinary";

// // HARD FAIL if env missing
// if (
//   !process.env.CLOUDINARY_CLOUD_NAME ||
//   !process.env.CLOUDINARY_API_KEY ||
//   !process.env.CLOUDINARY_API_SECRET
// ) {
//   throw new Error("Cloudinary env variables missing");
// }

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// console.log("Cloudinary Loaded:", {
//   cloud: process.env.CLOUDINARY_CLOUD_NAME,
//   keyExists: !!process.env.CLOUDINARY_API_KEY,
// });

// export default cloudinary;
