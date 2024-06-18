import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "10d" });
};

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

export const signup = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    const user = await User.signup(firstName, lastName, email, password, role);
    const token = createToken(user._id);

    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      token,
    };

    sendEmail(email, "Welcome to Event Management", `Hi ${firstName}, welcome to our platform!`);

    res.status(201).json({ message: "User created successfully", user: userData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    const token = createToken(user._id);
    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      token,
    };

    sendEmail(email, "Login Notification", `Hi ${user.firstName}, you have successfully logged in!`);

    res.status(201).json({ message: "User logged in successfully", user: userData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const profileView = async (req, res) => {
  const userId = req.params.id;
  try {
    const userProfile = await User.findById(userId);
    if (!userProfile) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User profile retrieved successfully", userProfile });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const profileEdit = async (req, res) => {
  const { firstName, lastName, email } = req.body;
  const { id } = req.params;
  try {
    const updatedProfile = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, email },
      { new: true }
    );
    if (!updatedProfile) {
      return res.status(404).json({ error: "User not found" });
    }

    sendEmail(email, "Profile Updated", `Hi ${firstName}, your profile has been updated successfully!`);

    res.status(200).json({ message: "User profile updated successfully", updatedProfile });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const profileDelete = async (req, res) => {
  const userId = req.params.id;
  try {
    const userProfile = await User.findByIdAndDelete(userId);
    if (!userProfile) {
      return res.status(404).json({ error: "User not found" });
    }

    sendEmail(userProfile.email, "Profile Deleted", `Hi ${userProfile.firstName}, your profile has been deleted.`);

    res.status(200).json({ message: "User profile deleted", userProfile });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updatePassword = async (req, res) => {
  const userId = req.params.id;
  const { password, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    sendEmail(user.email, "Password Updated", `Hi ${user.firstName}, your password has been updated successfully!`);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getProfiles = async (req, res) => {
  try {
    const profiles = await User.find();
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
