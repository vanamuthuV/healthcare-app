import { db } from "../config/firebase.config.js";
import { sendResponse } from "../util/response.util.js";
import { Timestamp } from "firebase-admin/firestore";

const addAppointmentDoctor = async (req, res) => {
  const { id, role } = req.user;
  const { patientId, date, time, reason, status } = req.body;

  console.log(patientId, date, time, reason, status);

  try {
    if (!id || !role || !patientId || !date || !time || !reason) {
      return sendResponse({
        data: null,
        message: "invalid data",
        res,
        status: 400,
        success: false,
      });
    }

    await db.collection("appointments").add({
      patientId: patientId,
      doctorId: id,
      date: String(date),
      time,
      reason,
      status: status ? status : "PENDING",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return sendResponse({
      data: {
        patientId: patientId,
        doctorId: id,
        date,
        time,
        reason,
        status: status ? status : "PENDING",
        createdAt: new Date().toISOString,
        updatedAt: new Date().toISOString,
      },
      message: "appointment addedd successfully",
      res,
      status: 200,
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    return sendResponse({
      data: null,
      message: "failed to add appointment",
      res,
      status: 500,
      success: false,
    });
  }
};

const getAppointmentsDoctor = async (req, res) => {
  const { id } = req.user;

  if (!id) {
    return sendResponse({
      data: null,
      message: "Invalid user data",
      res,
      status: 400,
      success: false,
    });
  }

  try {
    const snapshot = await db
      .collection("appointments")
      .where("doctorId", "==", id)
      .get();

    if (snapshot.empty) {
      return sendResponse({
        data: [],
        message: "Appointments fetched successfully",
        res,
        status: 200,
        success: true,
      });
    }

    const appointments = [];
    const patientIdsSet = new Set();

    snapshot.forEach((doc) => {
      const data = doc.data();
      data.id = doc.id;
      appointments.push(data);
      if (data.patientId) patientIdsSet.add(data.patientId);
    });

    const patientIds = Array.from(patientIdsSet);
    const patientDetails = await Promise.all(
      patientIds.map(async (patientId) => {
        const patientSnap = await db.collection("users").doc(patientId).get();
        return { id: patientId, ...patientSnap.data() };
      })
    );

    const patientMap = {};
    patientDetails.forEach((patient) => {
      patientMap[patient.id] = patient;
    });

    const enrichedAppointments = appointments.map((appointment) => ({
      ...appointment,
      patient: patientMap[appointment.patientId] || null,
    }));

    return sendResponse({
      data: enrichedAppointments,
      message: "appointments fetched successfully",
      res,
      status: 200,
      success: true,
    });
  } catch (error) {
    console.error("rrror fetching doctor appointments:", error);
    return sendResponse({
      data: null,
      message: "failed to fetch appointments",
      res,
      status: 500,
      success: false,
    });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const snapshot = await db
      .collection("users")
      .where("role", "==", "DOCTOR")
      .get();

    if (snapshot.empty) {
      return sendResponse({
        data: [],
        message: "No doctors found",
        res,
        status: 200,
        success: true,
      });
    }

    const doctors = [];
    snapshot.forEach((doc) => {
      doctors.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({
      success: true,
      data: doctors,
      message: "Doctors fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return sendResponse({
      data: null,
      message: "failed to fetch all doctors",
      res,
      status: 500,
      success: false,
    });
  }
};

const cancelAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const { id: userId, role } = req.user;

  if (!appointmentId) {
    return sendResponse({
      data: null,
      message: "Appointment id required",
      res,
      status: 400,
      success: false,
    });
  }

  try {
    const appointmentRef = db.collection("appointments").doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists) {
      return sendResponse({
        data: null,
        message: "appointment not found",
        res,
        status: 404,
        success: false,
      });
    }

    const appointment = appointmentDoc.data();

    if (appointment.patientId !== userId && appointment.doctorId !== userId) {
      return sendResponse({
        data: null,
        message: "you are not authrorized to cancel this appointment",
        res,
        status: 403,
        success: false,
      });
    }

    await appointmentRef.update({
      status: "CANCELLED",
      cancelledAt: new Date().toISOString(),
    });

    return sendResponse({
      data: null,
      message: "appointment cancelled successfully",
      res,
      status: 200,
      success: true,
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return sendResponse({
      data: null,
      message: "failed to cancel appointment",
      res,
      status: 500,
      success: false,
    });
  }
};

const updateAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const updates = req.body;
  const { id: userId, role } = req.user;

  if (!appointmentId) {
    return sendResponse({
      data: null,
      message: "appointment id is requried",
      res,
      status: 400,
      success: false,
    });
  }

  try {
    const appointmentRef = db.collection("appointments").doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists) {
      return sendResponse({
        data: null,
        message: "appointment not found",
        res,
        status: 404,
        success: false,
      });
    }

    const appointment = appointmentDoc.data();

    const isPatient = appointment.patientId === userId && role === "PATIENT";
    const isDoctor = appointment.doctorId === userId && role === "DOCTOR";
    if (!isPatient && !isDoctor) {
      return sendResponse({
        data: null,
        message: "you are not authorized to update this appointment",
        res,
        status: 403,
        success: false,
      });
    }

    const allowedFields = ["status", "date", "time", "reason", "notes"];
    const invalidFields = Object.keys(updates).filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return sendResponse({
        data: null,
        message: `Invalid fields: ${invalidFields.join(", ")}`,
        res,
        status: 400,
        success: false,
      });
    }

    updates.updatedAt = new Date().toISOString();

    await appointmentRef.update(updates);

    return sendResponse({
      data: null,
      message: "appointment updated successfully",
      res,
      status: 200,
      success: true,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return sendResponse({
      data: null,
      message: "failed to update appointment",
      res,
      status: 500,
      success: false,
    });
  }
};

const deleteAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  if (!appointmentId) {
    return sendResponse({
      data: null,
      message: "Appointment id invalid",
      res,
      status: 404,
      success: false,
    });
  }

  try {
    const appointmentRef = db.collection("appointments").doc(appointmentId);
    const doc = await appointmentRef.get();

    if (!doc.exists) {
      return sendResponse({
        data: null,
        message: "Appointment not found",
        res,
        status: 404,
        success: false,
      });
    }

    await appointmentRef.delete();

    return sendResponse({
      data: null,
      message: "Appointment delted success",
      res,
      status: 200,
      success: true,
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return sendResponse({
      data: null,
      message: "cannot delete appointment",
      res,
      status: 500,
      success: false,
    });
  }
};

export {
  addAppointmentDoctor,
  getAppointmentsDoctor,
  getAllDoctors,
  cancelAppointment,
  updateAppointment,
  deleteAppointment
};
