import express from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

//import from adminUserController
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateActiveStatus,
  updateRoleStatus,
  deleteUser,
} from "../controllers/admin/adminUserController.js";

//import from adminOrganizerController
import {
  getPendingOrganizerRequests,
  getOrganizerRequestById,
  updateOrganizerStatus,
} from "../controllers/admin/adminOrganizerController.js";

//import from adminEventController
import {
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getAllEventsAdmin,
} from "../controllers/admin/adminEventController.js";

//import from adminAnayticsController
//import { platformAnalytics } from "../controllers/admin/adminAnalyticeController.js";

const router = express.Router();

/*===================================USER_MODULE==========================================*/
//get all users
router.get("/users/getAllUsers", authenticate, authorize("admin"), getAllUsers);

//get user by id
router.get(
  "/users/getUserById/:id",
  authenticate,
  authorize("admin"),
  getUserById
);

//update user role by id
router.patch(
  "/users/updateUserRole/:id",
  authenticate,
  authorize("admin"),
  updateUserRole
);

//update user active statas=block/unblock=true/false
router.patch(
  "/users/updateActiveStatus/:id",
  authenticate,
  authorize("admin"),
  updateActiveStatus
);

//update role status =approved/pending/rejected
router.patch(
  "/users/updateRoleStatus/:id",
  authenticate,
  authorize("admin"),
  updateRoleStatus
);

//delete user
router.delete(
  "/users/deleteUser/:id",
  authenticate,
  authorize("admin"),
  deleteUser
);
/*==================================================ORGNIZER_REQUEST_MODULE=================================================*/
//get pending request
router.get(
  "/organizer/pending",
  authenticate,
  authorize("admin"),
  getPendingOrganizerRequests
);
//get pending request by id
router.get(
  "/organizer/request/:id",
  authenticate,
  authorize("admin"),
  getOrganizerRequestById
);

//update organizer request status
router.patch(
  "/organizer/updateStatus/:id",
  authenticate,
  authorize("admin"),
  updateOrganizerStatus
);

/*=============================================EVENT_MODULE=========================================== */
//get pending event request
router.get(
  "/events/getPendingEvents",
  authenticate,
  authorize("admin"),
  getPendingEvents
);

//update event request=approve
router.patch(
  "/events/approve/:eventId",
  authenticate,
  authorize("admin"),
  approveEvent
);

//update event request=reject
router.patch(
  "/events/reject/:eventId",
  authenticate,
  authorize("admin"),
  rejectEvent
);

//get all events
router.get(
  "/events/getAllEventsAdmin",
  authenticate,
  authorize("admin"),
  getAllEventsAdmin
);

/*===================================================ADMIN_ANALYTICS=======================================================*/
// router.get(
//   "/analytics/platformaAnalytics",
//   authenticate,
//   authorize("admin"),
//   platformAnalytics
// );

export default router;
