import express from "express";
import dotenv from "dotenv";
import { Hub } from "./src/routes/index.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { corsOptions } from "./src/config/cors.config.js";

dotenv.config();

const server = express();

server.use(cors(corsOptions));
server.use(express.json());
server.use(cookieParser());

server.use("/api", Hub);

server.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
