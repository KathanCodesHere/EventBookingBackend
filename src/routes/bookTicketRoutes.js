import express from "express";
import {
  bookTicket,
  getMyTickets,
  getTicketQRCode,
  downloadTicketPDF,
  cancelTicket,
} from "../controllers/bookTicketController.js";

import { authenticate } from "../middlewares/authMiddleware.js";
const router = express.Router();

//book ticket
router.post("/bookTicket", authenticate, bookTicket);

//get booked tickets
router.get("/my-tickets", authenticate, getMyTickets);

//get ticket QR code
router.get("/getTicketQRCode/:ticketId", authenticate, getTicketQRCode);

//download ticket
router.get("/download/:ticketId", authenticate, downloadTicketPDF);

//cancel ticket
router.patch("/cancel/:ticketId", authenticate, cancelTicket);

export default router;
