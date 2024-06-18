import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  markEventAsAttended,
  addFeedback,
  addDiscountCode,
  bookTicket,
} from "../controller/EventController.js";
import uploadImage from "../middleware/upload.js";

const router = express.Router();

router.post("/", uploadImage.single("image"), createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.put("/:id", uploadImage.single("image"), updateEvent);
router.delete("/:id", deleteEvent);
router.post("/:id/attend", markEventAsAttended);
router.post("/:id/feedback", addFeedback);
router.post("/:id/discount", addDiscountCode);
router.post("/:id/book", bookTicket);

export default router;
