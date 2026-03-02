const isLocal = typeof window !== 'undefined' && window.location.origin.startsWith('http://localhost');
export const API_BASE_URL = isLocal ? 'http://127.0.0.1:8080' : 'http://wechat.58haha.com';
export const API_SIGN_SECRET = (import.meta as ImportMeta).env?.VITE_API_SIGN_SECRET as string | undefined;
