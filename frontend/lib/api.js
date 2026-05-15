function resolveApiUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) {
    return configured.endsWith("/api") ? configured : `${configured.replace(/\/$/, "")}/api`;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }
  return "http://localhost:8080/api";
}

const API_URL = resolveApiUrl();

async function parseError(response) {
  const text = await response.text();
  try {
    const body = JSON.parse(text);
    if (body.fieldErrors) {
      return Object.values(body.fieldErrors).join(" ");
    }
    return body.message || text || "Request failed";
  } catch {
    return text || "Request failed";
  }
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return null;
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

export const api = {
  login(payload) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  register(payload) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  getDoctors() {
    return request("/doctors");
  },

  getSlots(doctorId, date) {
    return request(`/doctors/${doctorId}/slots?date=${date}`);
  },

  getAvailableDates(doctorId, from, to) {
    const params = new URLSearchParams();
    if (from) {
      params.set("from", from);
    }
    if (to) {
      params.set("to", to);
    }
    const query = params.toString();
    return request(`/doctors/${doctorId}/available-dates${query ? `?${query}` : ""}`);
  },

  getAppointments(token) {
    return request("/appointments", {
      headers: authHeader(token)
    });
  },

  searchAppointments(token, query) {
    const suffix = query ? `?q=${encodeURIComponent(query)}` : "";
    return request(`/appointments/search${suffix}`, {
      headers: authHeader(token)
    });
  },

  createAppointment(token, payload) {
    return request("/appointments", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(payload)
    });
  },

  updateAppointmentStatus(token, appointmentId, status) {
    return request(`/appointments/${appointmentId}/status`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify({ status })
    });
  },

  cancelAppointment(token, appointmentId) {
    return request(`/appointments/${appointmentId}/cancel`, {
      method: "PUT",
      headers: authHeader(token)
    });
  },

  getAdminDoctors(token) {
    return request("/admin/doctors", {
      headers: authHeader(token)
    });
  },

  createDoctor(token, payload) {
    return request("/admin/doctors", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(payload)
    });
  },

  activateDoctor(token, doctorId) {
    return request(`/admin/doctors/${doctorId}/activate`, {
      method: "PUT",
      headers: authHeader(token)
    });
  },

  deactivateDoctor(token, doctorId) {
    return request(`/admin/doctors/${doctorId}/deactivate`, {
      method: "PUT",
      headers: authHeader(token)
    });
  },

  generateSlots(token, payload) {
    return request("/admin/slots/generate", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(payload)
    });
  }
};

export function sessionFromAuthResponse(response) {
  return {
    token: response.accessToken,
    role: response.role,
    email: response.email,
    name: response.name
  };
}


