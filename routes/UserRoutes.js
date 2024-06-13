import express from "express";
import {
  login,
  profileDelete,
  profileEdit,
  profileView,
  signup,
  updatePassword,
  getProfiles,
} from "../controller/UserController.js";
import { verifyAuth } from "../middleware/verifyAuth.js";
import EventRoutes from "./EventRoutes.js";
import NotificationsRoutes from "./NotificationsRoutes.js";

const UserRouter = express.Router();
UserRouter.post("/signup", signup);

UserRouter.post("/login", login);

UserRouter.use(verifyAuth);

UserRouter.get("/profile/", getProfiles);

UserRouter.get("/profile/:id", profileView);

UserRouter.put("/profile/:id", profileEdit);

UserRouter.delete("/profile/:id", profileDelete);

UserRouter.put("/profile/password/:id", updatePassword);

UserRouter.use("/events", EventRoutes);
UserRouter.use("/notifications", NotificationsRoutes);

export default UserRouter;
