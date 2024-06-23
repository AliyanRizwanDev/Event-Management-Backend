import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  attendee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const DiscountCodeSchema = new mongoose.Schema({
  code: { type: String },
  discountPercentage: { type: Number, required: true, min: 0, max: 100 },
  expiryDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const TicketTypeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  remaining: { type: Number },
});

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  ticketTypes: [TicketTypeSchema],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  feedback: [FeedbackSchema],
  discountCodes: [DiscountCodeSchema],
  createdAt: { type: Date, default: Date.now },
  image: { type: String },
});

export default mongoose.model("Event", EventSchema);
