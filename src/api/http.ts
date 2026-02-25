/**
 * src/api/http.ts
 * Axios instance for API requests.
 */
import axios from "axios";

export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
    timeout: 30000,
});
