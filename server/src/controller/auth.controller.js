import { db } from "../config/firebase.config.js";
import { sendResponse } from "../util/response.util.js";
import bcrypt from "bcrypt";
import dotenc from "dotenv"

dotenc.config()

const registerController = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return sendResponse({
        data: null,
        message: "Few fields are empty",
        res,
        status: 400,
        success: false,
      });
    }

    const userSnap = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (!userSnap.empty) {
      return sendResponse({
        data: null,
        message: "Email already taken",
        res,
        status: 200,
        success: false,
      });
    } else {
      const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND, 10));

      await db.collection("users").add({
        name,
        email,
        role,
        password: hashedPassword,
        createdAt: new Date(),
      });

      return sendResponse({
        data: null,
        message: `Dear ${name}, registeration is success`,
        res,
        status: 200,
        success: true,
      });
    }
  } catch (error) {
    console.log(error.message);

    return sendResponse({
      data: null,
      message: "something went wrong from our end",
      res,
      status: 500,
      success: false,
    });
  }
};

export { registerController };
