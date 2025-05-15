import { db } from "../config/firebase.config.js";
import { sendResponse } from "../util/response.util.js";

const addAppointment = async (req, res) => {
  const { id, role } = req.user;
  const { doctorId, date, time, reason, status } = req.body;

  try {
    if (!id || !role || !doctorId || !date || !time || !reason) {
      return sendResponse({
        data: null,
        message: "invalid data",
        res,
        status: 400,
        success: false,
      });
    }

    await db.collection("appointments").add({
      patientId: id,
      doctorId: doctorId,
      date,
      time,
      reason,
      status: "PENDING",
      createdAt: new Date().toISOString,
      updatedAt: new Date().toISOString,
    });

    return sendResponse({
      data: {
        patientId: id,
        doctorId: doctorId,
        date,
        time,
        reason,
        status: "PENDING",
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

const getAppointmentsPatient = async (req, res) => {
  const { id } = req.user;

  console.log("You landed here");

  if (!id) {
    return sendResponse({
      data: null,
      message: "invalid data",
      res,
      status: 400,
      success: false,
    });
  }

  try {
    const snapshot = await db
      .collection("appointments")
      .where("patientId", "==", id)
      .get();

    if (snapshot.empty) {
      return sendResponse({
        data: [],
        message: "appointments feteched success",
        res,
        status: 200,
        success: true,
      });
    }

    const appointments = [];

    const doctorIdsSet = new Set();

    snapshot.forEach((doc) => {
      const data = doc.data();
      data.id = doc.id;
      appointments.push(data);
      if (data.doctorId) doctorIdsSet.add(data.doctorId);
    });

    const doctorIds = Array.from(doctorIdsSet);

    const doctorDetails = await Promise.all(
      doctorIds.map(async (docId) => {
        const docSnap = await db.collection("users").doc(docId).get();
        return { id: docId, ...docSnap.data() };
      })
    );

    const doctorMap = {};
    doctorDetails.forEach((doc) => {
      doctorMap[doc.id] = doc;
    });

    const enrichedAppointments = appointments.map((appointment) => ({
      ...appointment,
      doctor: doctorMap[appointment.doctorId] || null,
    }));

    return sendResponse({
      data: enrichedAppointments,
      message: "appointments fetch success",
      res,
      status: 200,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return sendResponse({
      data: null,
      message: "failed to fetch appointments",
      res,
      status: 500,
      success: false,
    });
  }
};

const getPatientProfileWithAppointments = async (req, res) => {
  const { patientId } = req.params;

  if (!patientId) {
    return res.status(400).json({
      success: false,
      message: "Patient ID is required",
    });
  }

  try {
    const userDoc = await db.collection("users").doc(patientId).get();

    if (!userDoc.exists) {
      return sendResponse({
        data: null,
        message: "patient not found",
        res,
        status: 404,
        success: false,
      });
    }

    const patientData = { id: userDoc.id, ...userDoc.data() };

    const snapshot = await db
      .collection("appointments")
      .where("patientId", "==", patientId)
      .get();

    const appointments = [];
    snapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });

    return sendResponse({
      data: {
        patient: patientData,
        appointments,
      },
      message: "patient fetch success",
      res,
      status: 200,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    return sendResponse({
      data: null,
      message: "failed to fetch patiet profile",
      res,
      status: 500,
      success: false,
    });
  }
};

const getAllPatients = async (req, res) => {
  try {
    const patientsSnap = await db
      .collection("users")
      .where("role", "==", "PATIENT")
      .get();

    const patients = patientsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return sendResponse({
      data: patients,
      message: "patients fetch success",
      res,
      status: 200,
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    return sendResponse({
      data: null,
      message: "failed to load patients",
      res,
      status: 500,
      success: false,
    });
  }
};

export {
  addAppointment,
  getAppointmentsPatient,
  getPatientProfileWithAppointments,
  getAllPatients,
};
