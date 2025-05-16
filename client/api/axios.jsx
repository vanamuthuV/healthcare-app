import axios from "axios";

// const baseURL = "http://localhost:5000/api";

const baseURL = "https://healthcareappserver.onrender.com/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export { api };
