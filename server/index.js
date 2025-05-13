import express from "express";
import dotenv from "dotenv";
import { Hub } from "./src/routes/index.route.js";

dotenv.config();

const server = express();

server.use(express.json())

server.use("/api", Hub);

server.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
