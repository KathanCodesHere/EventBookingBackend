import express from "express";
import {
  bookTicket,
  getMyTickets,
} from "../controllers/bookTicketController.js";

import { authenticate } from "../middlewares/authMiddleware.js";
const router = express.Router();

//book ticket
router.post("/bookTicket", authenticate, bookTicket);

//get booked tickets
router.get("/my-tickets", authenticate, getMyTickets);

export default router;
