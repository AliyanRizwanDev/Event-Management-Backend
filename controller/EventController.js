import Event from "../models/EventModel.js";
import User from "../models/UserModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cron from "node-cron";
import uploadImage  from "../middleware/upload.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_HOST_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.MAILTRAP_HOST_SENDER,
    to: to,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, venue, ticketTypes, discountCodes, organizer } = req.body;

    
    let parsedTicketTypes;
    let parsedDiscountCodes;
    try {
      parsedTicketTypes = typeof ticketTypes === 'string' ? JSON.parse(ticketTypes) : ticketTypes;
      parsedDiscountCodes = typeof discountCodes === 'string' ? JSON.parse(discountCodes) : discountCodes;
    } catch (error) {
      return res.status(400).json({ message: "Invalid format for ticketTypes or discountCodes", error });
    }
    console.log("File:",req.file);

    
    const event = new Event({
      title,
      description,
      date,
      time,
      venue,
      ticketTypes: parsedTicketTypes,
      discountCodes: parsedDiscountCodes,
      organizer,
      image: req.file ? req.file.filename : null 
    });

    await event.save();


    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Error creating event", error });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
      const { title, description, date, time, venue, ticketTypes, discountCodes, organizer } = req.body;
      
      let parsedTicketTypes;
      let parsedDiscountCodes;
      try {
          parsedTicketTypes = typeof ticketTypes === 'string' ? JSON.parse(ticketTypes) : ticketTypes;
          parsedDiscountCodes = typeof discountCodes === 'string' ? JSON.parse(discountCodes) : discountCodes;
      } catch (error) {
          return res.status(400).json({ message: "Invalid format for ticketTypes or discountCodes", error });
      }

      const event = await Event.findById(req.params.id);
      if (!event) {
          return res.status(404).json({ message: "Event not found" });
      }

      event.title = title;
      event.description = description;
      event.date = date;
      event.time = time;
      event.venue = venue;
      event.ticketTypes = parsedTicketTypes;
      event.discountCodes = parsedDiscountCodes;
      event.organizer = organizer;

      if (req.file) {
          event.image = req.file.filename;
      }

      await event.save();

      sendEmail(
          event.organizer.email,
          "Event Updated",
          `Your event ${event.title} has been updated successfully.`
      );

      res.status(200).json(event);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};


export const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    sendEmail(
      deletedEvent.organizer.email,
      "Event Deleted",
      `Your event ${deletedEvent.title} has been deleted.`
    );

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markEventAsAttended = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.body.attendee;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.attendees.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You are already attending this event" });
    }

    event.attendees.push(userId);
    await event.save();

    const user = await User.findById(userId);
    sendEmail(
      user.email,
      "Event Attendance",
      `You have been marked as attending the event ${event.title}.`
    );

    return res.status(200).json({ message: "Event marked as attended", event });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const addFeedback = async (req, res) => {
  const eventId = req.params.id;
  const { attendee, rating, comment } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: `Event not found ${eventId}` });
    }

    if (!comment) {
      return res.status(400).json({ message: "Comment is required" });
    }

    event.feedback.push({ attendee, rating, comment });
    await event.save();

    const user = await User.findById(attendee);
    sendEmail(
      user.email,
      "Feedback Received",
      `Thank you for your feedback on the event ${event.title}.`
    );

    res.status(201).json({ message: "Feedback added successfully", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addDiscountCode = async (req, res) => {
  const eventId = req.params.id;
  const { code, discountPercentage, expiryDate } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const existingCode = event.discountCodes.find((dc) => dc.code === code);
    if (existingCode) {
      return res.status(400).json({ message: "Discount code already exists" });
    }

    event.discountCodes.push({ code, discountPercentage, expiryDate });
    await event.save();

    sendEmail(
      event.organizer.email,
      "Discount Code Added",
      `A discount code has been added to your event ${event.title}.`
    );

    res
      .status(201)
      .json({ message: "Discount code added successfully", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bookTicket = async (req, res) => {
  const { eventId, attendee, ticketType, discountCode } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.attendees.includes(attendee)) {
      return res
        .status(400)
        .json({ message: "You are already attending this event" });
    }

    const ticketIndex = event.ticketTypes.findIndex(
      (t) => t.type === ticketType
    );
    if (ticketIndex === -1) {
      return res.status(404).json({ message: "Ticket type not found" });
    }

    const ticket = event.ticketTypes[ticketIndex];
    let finalPrice = ticket.price;

    if (discountCode) {
      const discount = event.discountCodes.find(
        (dc) => dc.code === discountCode && new Date(dc.expiryDate) > new Date()
      );
      if (discount) {
        finalPrice = finalPrice * (1 - discount.discountPercentage / 100);
      } else {
        return res
          .status(400)
          .json({ message: "Invalid or expired discount code" });
      }
    }

    if (ticket.quantity <= 0) {
      return res
        .status(400)
        .json({ message: "No tickets available for this type" });
    }

    event.ticketTypes[ticketIndex].quantity -= 1;
    event.ticketTypes[ticketIndex].remaining += 1;

    event.attendees.push(attendee);
    await event.save();

    const user = await User.findById(attendee);
    sendEmail(
      user.email,
      "Ticket Booked",
      `Your ticket for the event ${event.title} has been booked successfully.`
    );

    res.status(200).json({ message: "Booking successful", finalPrice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const scheduleReminders = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const events = await Event.find();
      const now = new Date();

      events.forEach((event) => {
        const eventDate = new Date(event.date);
        const threeDaysBefore = new Date(eventDate);
        threeDaysBefore.setDate(eventDate.getDate() - 3);

        event.attendees.forEach(async (attendeeId) => {
          const user = await User.findById(attendeeId);

          if (now.toDateString() === threeDaysBefore.toDateString()) {
            sendEmail(
              user.email,
              "Event Reminder",
              `Reminder: Your event ${event.title} is happening in 3 days!`
            );
          } else if (now.toDateString() === eventDate.toDateString()) {
            sendEmail(
              user.email,
              "Event Reminder",
              `Reminder: Your event ${event.title} is happening today!`
            );
          }
        });
      });
    } catch (error) {
      console.error("Error sending reminders:", error);
    }
  });
};

scheduleReminders();
