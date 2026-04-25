// Ưu tiên lấy từ biến môi trường VITE_API_URL, nếu không có mới dùng localhost
export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:5122/api");
