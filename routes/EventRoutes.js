import express from "express";
import path from "path";
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

const router = express.Router();
// const imagesDirectory = new URL("../Public/images", import.meta.url).pathname;

// router.use("/images", express.static(path.resolve(imagesDirectory)));

// router.post("/", upload.single("image"), createEvent);

router.post("/", createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);
router.post("/:id/attend", markEventAsAttended);
router.post("/:id/feedback", addFeedback);
router.post("/:id/discount", addDiscountCode);
router.post("/:id/book", bookTicket);

export default router;
