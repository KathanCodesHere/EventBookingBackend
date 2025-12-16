import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadToCloudinary = (file, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file provided"));

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};
