import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import UserRoutes from "./Routes/UserRoutes.js";
import path from "path";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/user", UserRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Listening on PORT ${process.env.PORT}`);
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connect to DB");
    })
    .catch((error) => {
      console.log(error);
    });
});
