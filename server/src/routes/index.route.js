import { Router } from "express";
import { authRouter } from "./auth.route.js";

const Hub = Router();

Hub.use("/auth", authRouter);

export { Hub };
