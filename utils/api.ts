import axios from "axios";
import env from "../config/env";

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

const apiClient = axios.create({
  baseURL: `${env.API_DOMAIN}/`,
  headers,
});

export default apiClient;
