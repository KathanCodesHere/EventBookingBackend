import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const result = await uploadToCloudinary(req.file.buffer, "profile_images");

    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("uploadImage error:", error);
    res.status(500).json({
      message: "Image upload failed",
      error: error.message,
    });
  }
};
