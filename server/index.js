import express from "express";
import dotenv from "dotenv";
import { Hub } from "./src/routes/index.route.js";
import cookieParser from "cookie-parser";

dotenv.config();

const server = express();

server.use(express.json())
server.use(cookieParser())

server.use("/api", Hub);

server.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
