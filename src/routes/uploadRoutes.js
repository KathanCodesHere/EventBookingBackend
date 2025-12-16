import express from "express";
const router = express.Router();
import upload from "../utils/multer.js";

import {
  uploadImage,
  uploadMultipleImages,
} from "../controllers/uploadController.js";

//upload image route
router.post("/uploadImage", upload.single("image"), uploadImage);

router.post("/uploadImages", upload.array("images", 10), uploadMultipleImages);
export default router;
