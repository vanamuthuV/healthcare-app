import { db } from "../config/firebase.config";
import { sendResponse } from "../util/response.util";

const addAppointment = async (req, res) => {
  const { id, role } = req.user;
  const { patdocid, date, time, reason, status } = req.body;

  try {
    if (!id || !role || !patdocid || !date || !time || !reason || !status) {
      return sendResponse({
        data: null,
        message: "invalid data",
        res,
        status: 400,
        success: false,
      });
    }

    await db.collection("appointments").add({
      patientId: role == "DOCTOR" ? patdocid : id,
      doctorId: role == "DOCTOR" ? id : patdocid,
      date,
      time,
      reason,
      status: "PENDING",
      createdAt: new Date(),
    });

    return sendResponse({
      data: {
        patientId: role == "DOCTOR" ? patdocid : id,
        doctorId: role == "DOCTOR" ? id : patdocid,
        date,
        time,
        reason,
        status: "PENDING",
        createdAt: new Date(),
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

export { addAppointment };
