import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";

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

//cancel ticket
export const cancelTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user._id;

    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket) return sendNotFound(res, "Ticket not found");

    if (ticket.userId.toString() !== userId.toString()) {
      return sendError(res, "Not authorized to cancel this ticket");
    }

    if (ticket.status === "cancelled") {
      return sendError(res, "Ticket already cancelled");
    }

    const event = await Event.findById(ticket.eventId);
    if (!event) return sendNotFound(res, "Event not found");

    if (new Date(event.date) < new Date()) {
      return sendError(res, "Past event tickets cannot be cancelled");
    }

    ticket.status = "cancelled";
    await ticket.save();

    return sendSuccess(res, ticket, "Ticket cancelled successfully");
  } catch (err) {
    console.error("cancelTicket:", err);
    return sendError(res, "Error cancelling ticket");
  }
};

//get ticket QRCode
export const getTicketQRCode = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user._id;

    const ticket = await Ticket.findOne({ ticketId }).populate(
      "eventId",
      "title date location"
    );

    if (!ticket) return sendNotFound(res, "Ticket not found");

    if (ticket.userId.toString() !== userId.toString())
      return sendError(res, "Not authorized");

    const qrDataUrl = await QRCode.toDataURL(ticket.ticketId);

    return sendSuccess(res, {
      ticketId: ticket.ticketId,
      event: ticket.eventId,
      qr: qrDataUrl,
    });
  } catch (err) {
    console.error("getTicketQRCode:", err);
    return sendError(res, "Error generating QR");
  }
};

//download ticket
export const downloadTicketPDF = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user._id;

    const ticket = await Ticket.findOne({ ticketId })
      .populate("eventId")
      .populate("userId");

    if (!ticket) return sendNotFound(res, "Ticket not found");

    if (ticket.userId._id.toString() !== userId.toString())
      return sendError(res, "Not authorized");

    // QR should contain URL
    const qrUrl = process.env.QR_URL;
    const qrData = await QRCode.toDataURL(qrUrl);

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${ticket.ticketId}.pdf`
    );

    doc.pipe(res);

    // Title
    doc.fontSize(22).text(ticket.eventId.title, { align: "center" });
    doc.moveDown(1);

    // Ticket info
    doc.fontSize(12).text(`Ticket ID: ${ticket.ticketId}`);
    doc.text(`User: ${ticket.userId?.username || "N/A"}`);
    doc.text(`Event Date: ${new Date(ticket.eventId.date).toDateString()}`);
    doc.text(`Price: ₹${ticket.eventId.price}`);
    doc.text(`Status: booked`);
    doc.moveDown(1);

    // Venue
    const loc = ticket.eventId.location;
    doc.text("Venue:", { underline: true });
    doc.text(`${loc.address}, ${loc.street}`);
    doc.text(`${loc.city}, ${loc.state} - ${loc.pincode}`);
    doc.moveDown(1);

    // QR Code
    const qrImage = qrData.split(",")[1];
    const qrBuffer = Buffer.from(qrImage, "base64");
    doc.image(qrBuffer, { width: 160, align: "center" });
    doc.moveDown(1);

    doc
      .fontSize(10)
      .text(
        "Terms & Conditions:\n" +
          "- Carry a valid Photo ID.\n" +
          "- Ticket once scanned cannot be reused.\n" +
          "- The organizer reserves all rights.",
        { align: "left" }
      );

    doc.end();
  } catch (err) {
    console.error("downloadTicketPDF:", err);
    return sendError(res, "Error generating ticket PDF");
  }
};
