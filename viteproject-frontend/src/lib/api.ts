// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// 末尾に / が付いてないかチェック（超重要！）
const BASE_URL = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

export { BASE_URL };