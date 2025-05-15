import { Router } from "express";
import {
  loginController,
  Me,
  registerController,
  Logout,
} from "../controller/auth.controller.js";
import { Authentication } from "../middleware/authentication.middleware.js";

const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.get("/me", Authentication, Me);
authRouter.get("/logout", Logout);

export { authRouter };
