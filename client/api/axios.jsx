import axios from "axios";

// const baseURL = "http://localhost:5000/api";

const baseURL = "https://healthcare-app-sepia.vercel.app/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export { api };
