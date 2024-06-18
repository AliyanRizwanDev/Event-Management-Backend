import Notification from "../models/NotificationsModel.js";
import User from "../models/UserModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
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

export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const newNotification = await Notification.create(req.body);

    const attendees = await User.find({ role: "attendee" });

    attendees.forEach((attendee) => {
      sendEmail(attendee.email, "New Notification", req.body.message);
    });

    res.status(201).json(newNotification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.id });
    if (!notifications) {
      return res.status(404).json({ message: "Notifications not found" });
    }
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    sendEmail(
      notification.email,
      "Notification Canceled",
      "Your notification has been canceled."
    );

    res.status(200).json({ message: "Notification canceled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
