import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { sendError, sendSuccess } from "../utils/responseHandler.js";

export const uploadImage = async (req, res) => {
  try {
    const { eventName } = req.body;
    if (!req.file) return sendError(res, "File is required");

    const result = await uploadToCloudinary(req.file, eventName);

    return sendSuccess(res, { url: result.url }, "Image uploaded successfully");
  } catch (error) {
    console.error(error);
    return sendError(res, "Image upload failed");
  }
};

export const uploadMultipleImages = async (req, res) => {
  try {
    const { eventName } = req.body;

    if (!req.files || req.files.length < 5)
      return sendError(res, "Minimum 5 images required");

    if (req.files.length > 10)
      return sendError(res, "Maximum 10 images allowed");

    const urls = [];

    for (const file of req.files) {
      const result = await uploadToCloudinary(file, eventName);
      urls.push(result.url);
    }

    return sendSuccess(res, { urls }, "Images uploaded successfully");
  } catch (error) {
    console.error(error);
    return sendError(res, "Multiple image upload failed");
  }
};
