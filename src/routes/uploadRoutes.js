import express from "express";
const router = express.Router();
import upload from "../utils/multer.js";

import { uploadImage } from "../controllers/uploadController.js";

//upload image route
router.post("/uploadImage", upload.single("image"), uploadImage);

export default router;
