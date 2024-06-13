import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import UserRoutes from "./Routes/UserRoutes.js";
import path from "path";
dotenv.config();
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
app.use("/user", UserRoutes);
app.use(
  "/api/uploads",
  express.static(path.join(__dirname, "Public", "uploads"))
);

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
