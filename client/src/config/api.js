// API 기본 URL
const viteApiUrl = import.meta.env.VITE_API_URL;
console.log("🔍 환경변수 확인:");
console.log("- VITE_API_URL:", viteApiUrl);
console.log("- 모든 환경변수:", import.meta.env);

export const API_BASE_URL =
  viteApiUrl || "https://port-0-vibe-coding-shopping-mall-mfwj26quad3b6c41.sel3.cloudtype.app/";
console.log("- 최종 API_BASE_URL:", API_BASE_URL);
