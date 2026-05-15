const STORAGE_KEY = "clinical_auth";

export function getAuth() {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuth(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isRole(session, role) {
  return session?.role === role;
}
