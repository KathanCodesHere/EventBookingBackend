import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import {
  sendSuccess,
  sendError,
  sendNotFound,
} from "../utils/responseHandler.js";

//user book ticket
export const bookTicket = async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventId, quantity = 1 } = req.body;

    // validate eventId
    const event = await Event.findById(eventId);
    if (!event) return sendNotFound(res, "Event not found");

    // TODO: handle availability, payment integration (Razorpay etc.)
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticketId = uuidv4();
      const ticket = await Ticket.create({
        ticketId,
        eventId,
        userId,
        price: event.price,
      });

      // generate QR as base64 dataURL (small events ok; for large scale store file or use cloud)
      const qrDataUrl = await QRCode.toDataURL(ticketId);
      tickets.push({
        ticket,
        qrDataUrl, // send to user so frontend can render or email
      });
    }

    return sendSuccess(res, tickets, "Ticket(s) booked successfully");
  } catch (err) {
    console.error("bookTicket:", err);
    return sendError(res, "Something went wrong while booking");
  }
};

//get mytickets -user get ticket
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user._id }).populate(
      "eventId",
      "title description date price location images"
    );

    // Format response
    const formatted = tickets.map((t) => ({
      ticketId: t.ticketId,
      isScanned: t.isScanned,
      scannedAt: t.scannedAt,
      event: {
        title: t.eventId.title,
        description: t.eventId.description,
        date: t.eventId.date,
        price: t.eventId.price,
        location: t.eventId.location,
        images: t.eventId.images,
      },
    }));

    return sendSuccess(res, formatted, "My tickets fetched");
  } catch (err) {
    console.error("Error fetching tickets:", err);
    return sendError(res, "Error fetching tickets");
  }
};
