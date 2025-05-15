import { Router } from "express";
import {
  addAppointment,
  getAppointmentsPatient,
  getPatientProfileWithAppointments,
} from "../controller/patient.controller.js";

const patientRouter = Router();

patientRouter.post("/", addAppointment);
patientRouter.get("/", getAppointmentsPatient);
patientRouter.get("/:patientId", getPatientProfileWithAppointments);

export { patientRouter };
