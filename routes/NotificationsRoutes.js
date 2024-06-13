import express from "express";
import {
  createNotification,
  getNotificationById,
  deleteNotification,
  getAllNotifications,
} from "../controller/NotificationsController.js";

const router = express.Router();

router.get("/", getAllNotifications);
router.post("/", createNotification);
router.get("/:id", getNotificationById);
router.delete("/cancel/:id", deleteNotification);

export default router;
