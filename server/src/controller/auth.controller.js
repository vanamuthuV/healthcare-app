import { db } from "../config/firebase.config.js";
import { SignToken } from "../util/jwt.util.js";
import { sendResponse } from "../util/response.util.js";
import bcrypt from "bcrypt";
import dotenc from "dotenv";

dotenc.config();

const registerController = async (req, res) => {
  try {
    const { name, email, password, role, specialization } = req.body;

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
      const hashedPassword = await bcrypt.hash(
        String(password),
        parseInt(process.env.SALT_ROUND, 10)
      );

      await db.collection("users").add({
        name,
        email,
        role,
        password: hashedPassword,
        specialization: specialization ? specialization : null,
        isfirstlogin: true,
        createdAt: new Date(),
      });

      return sendResponse({
        data: null,
        message: `Dear ${name}, registeration is success, please login`,
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

const loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return sendResponse({
        data: null,
        message: "Insufficient data to process",
        res,
        status: 400,
        success: false,
      });
    }

    const user = await db.collection("users").where("email", "==", email).get();

    if (user.empty) {
      return sendResponse({
        data: null,
        message: "user not registered",
        res,
        status: 200,
        success: false,
      });
    }

    const snap = user.docs[0];
    const document = { id: snap.id, ...snap.data() };

    if (await bcrypt.compare(String(password), document.password)) {
      const token = SignToken(document);

      delete document.password;

      return res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 24 * 60 * 60 * 1000,
        })
        .json({
          data: document,
          message: "login success",
          success: true,
        });
    } else {
      return sendResponse({
        data: null,
        message: "incorrect password",
        res,
        status: 200,
        success: false,
      });
    }
  } catch (error) {
    console.log(error.message);
    return sendResponse({
      data: null,
      message: "something went wrong",
      res,
      status: 500,
      success: false,
    });
  }
};

const Me = async (req, res) => {
  if (!req.user) {
    return sendResponse({
      data: null,
      message: "user not authenticated",
      res,
      status: 403,
      success: false,
    });
  }

  return sendResponse({
    data: req.user,
    message: "session restored",
    res,
    status: 200,
    success: true,
  });
};

const Logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // or "strict" if you're not using cross-site
  });

  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
};

export { registerController, loginController, Me, Logout };
