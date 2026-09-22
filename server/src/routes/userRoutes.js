import express from "express";
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// GET all users
router.get("/", authMiddleware, authorizeRoles("Admin"), getAllUsers);

// POST a new user
router.post("/", authMiddleware, authorizeRoles("Admin"), createUser);

// GET user by ID
router.get("/:id", authMiddleware, authorizeRoles("Admin"), getUserById);

// UPDATE user by ID
router.put("/:id", authMiddleware, authorizeRoles("Admin"), updateUser);

// DELETE user by ID
router.delete("/:id", authMiddleware, authorizeRoles("Admin"), deleteUser);

export default router;