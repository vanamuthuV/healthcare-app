import { Verify } from "../util/jwt.util.js";
import { sendResponse } from "../util/response.util.js";

const Authentication = async (req, res, next) => {
  try {

    const token = req.cookies.token;

    if (!token) {
      return sendResponse({
        data: null,
        message: "user not authenticated",
        res,
        status: 403,
        success: false,
      });
    }

    const data = Verify(token);

    if (data.valid) {
      req.user = data.data;
      next();
    } else {
      return sendResponse({
        data: null,
        message: data.error,
        res,
        status: 403,
        success: false,
      });
    }
  } catch (error) {
    return sendResponse({
      data: null,
      message: "something went wrong",
      res,
      status: 500,
      success: false,
    });
  }
};

export { Authentication };
