import { Router } from "express";
import {
  addAppointmentDoctor,
  getAllDoctors,
  getAppointmentsDoctor,
  cancelAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controller/doctor.controller.js";

const doctorRouter = Router();

doctorRouter.post("/", addAppointmentDoctor);
doctorRouter.get("/", getAppointmentsDoctor);
doctorRouter.get("/all", getAllDoctors);
doctorRouter.patch("/:appointmentId", cancelAppointment),
  doctorRouter.put("/:appointmentId", updateAppointment);
doctorRouter.delete("/:appointmentId", deleteAppointment)

export { doctorRouter };
