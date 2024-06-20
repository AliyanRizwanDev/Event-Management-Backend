import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.statics.signup = async function (
  firstName,
  lastName,
  email,
  password,
  role
) {
  if (!firstName || !lastName || !email || !password || !role) {
    throw new Error("All fields must be filled");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Please enter a valid email address");
  }
  if (password.length <= 6) {
    throw new Error("Please enter a strong password");
  }
  if (role != "attendee" && role != "organizer" && role != "admin") {
    throw new Error("Invalid role");
  }

  const exist = await this.findOne({ email });
  if (exist) {
    throw new Error("Email is already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({
    firstName,
    lastName,
    email,
    password: hash,
    role,
  });
  return user;
};

UserSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw new Error("All fields must be filled");
  }
  const user = await this.findOne({ email });

  if (!user) {
    throw new Error("Incorrect email");
  }
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new Error("Incorrect password");
  }
  return user;
};

const User = mongoose.model("User", UserSchema);
export default User;
