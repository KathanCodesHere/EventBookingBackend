// import User from "../../models/user.js";
// import Event from "../../models/Event.js";
// import Ticket from "../../models/Ticket.js";
// import Order from "../../models/Order.js"; // Revenue / Payment model
// import { sendSuccess, sendError } from "../../utils/responseHandler.js";

// export const platformAnalytics = async (req, res) => {
//   try {
//     // RUN ALL QUERIES IN PARALLEL FOR MAX SPEED
//     const [
//       totalUsers,
//       totalOrganizers,
//       totalEvents,
//       pendingEvents,
//       approvedEvents,
//       rejectedEvents,
//       activeEvents,
//       ticketStats,
//       revenueStats,
//     ] = await Promise.all([
//       User.countDocuments({ role: "user" }),
//       User.countDocuments({ role: "organizer" }),
//       Event.countDocuments(),
//       Event.countDocuments({ status: "pending" }),
//       Event.countDocuments({ status: "approved" }),
//       Event.countDocuments({ status: "rejected" }),
//       Event.countDocuments({ status: "active" }),

//       // total tickets sold
//       Ticket.aggregate([
//         { $group: { _id: null, ticketsSold: { $sum: "$quantity" } } },
//       ]),

//       // total revenue
//       Order.aggregate([
//         { $match: { paymentStatus: "success" } },
//         { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
//       ]),
//     ]);

//     const analytics = {
//       users: {
//         totalUsers,
//         totalOrganizers,
//       },
//       events: {
//         totalEvents,
//         pendingEvents,
//         approvedEvents,
//         rejectedEvents,
//         activeEvents,
//       },
//       sales: {
//         totalTicketsSold: ticketStats?.[0]?.ticketsSold || 0,
//         totalRevenue: revenueStats?.[0]?.totalRevenue || 0,
//       },
//     };

//     return sendSuccess(res, analytics, "Platform analytics fetched");
//   } catch (err) {
//     console.error("Platform analytics error:", err);
//     return sendError(res, "Error fetching platform analytics");
//   }
// };
