import { Router } from "express";
import { authRouter } from "./auth.route.js";
import { patientRouter } from "./patient.route.js";
import { Authentication } from "../middleware/authentication.middleware.js";
import { doctorRouter } from "./doctor.route.js";

const Hub = Router();

Hub.use("/auth", authRouter);
Hub.use("/patient", Authentication, patientRouter);
Hub.use("/doctor", Authentication, doctorRouter);

export { Hub };
