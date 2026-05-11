const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "API request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
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
  getAppointments(token) {
    return request("/appointments", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  createAppointment(token, payload) {
    return request("/appointments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
  },
  updateAppointmentStatus(token, appointmentId, status) {
    return request(`/appointments/${appointmentId}/status`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
  },
  createDoctor(token, payload) {
    return request("/admin/doctors", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
  },
  generateSlots(token, payload) {
    return request("/admin/slots/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
  }
};
