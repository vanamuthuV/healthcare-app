import { Router } from "express";
import { registerController } from "../controller/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", registerController);

export { authRouter };
