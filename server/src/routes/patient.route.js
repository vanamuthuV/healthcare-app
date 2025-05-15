import { Router } from "express";
import {
  addAppointment,
  getAppointmentsPatient,
  getPatientProfileWithAppointments,
  getAllPatients,
  updateAppointment,
} from "../controller/patient.controller.js";

const patientRouter = Router();

patientRouter.post("/", addAppointment);
patientRouter.get("/", getAppointmentsPatient);
patientRouter.get("/all", getAllPatients);
patientRouter.get("/:patientId", getPatientProfileWithAppointments);
patientRouter.patch("/:appointmentId", updateAppointment);

export { patientRouter };
