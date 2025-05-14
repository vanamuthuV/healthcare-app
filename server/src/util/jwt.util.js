import jsonwebtoken from "jsonwebtoken";

const SignToken = (data) => {
  return jsonwebtoken.sign(data, process.env.JWT_SECRET, {
    expiresIn: "14d",
  });
};

const Verify = (token) => {
  try {
    const data = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    return { valid: true, data };
  } catch (err) {
    let message = "Authentication failed";

    if (err.name === "TokenExpiredError") {
      message = "Your session has expired. Please log in again.";
    } else if (err.name === "JsonWebTokenError") {
      message = "Invalid token. Please log in again.";
    }

    return { valid: false, error: message };
  }
};

export { SignToken, Verify };
