const sendResponse = ({ res, status, message, success, data }) => {
  res.status(status).json({
    success,
    message,
    data,
  });
};

export { sendResponse };
