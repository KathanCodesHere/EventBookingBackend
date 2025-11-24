import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { authorize } from "../../middlewares/authMiddleware.js";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateActiveStatus,
  updateRoleStatus,
  deleteUser,
} from "../../controllers/admin/adminUserController.js";

const router = express.Router();

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

export default router;
