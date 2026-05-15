"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

const initialLogin = { email: "", password: "" };
const initialRegister = { name: "", email: "", password: "", phone: "" };

export function AuthPanel({
  title,
  description,
  allowRegister = true,
  onLogin,
  onRegister,
  loading = false
}) {
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [error, setError] = useState("");

  function updateLogin(field, value) {
    setLoginForm((current) => ({ ...current, [field]: value }));
  }

  function updateRegister(field, value) {
    setRegisterForm((current) => ({ ...current, [field]: value }));
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    if (!loginForm.email || !loginForm.password) {
      setError("Email and password are required.");
      return;
    }
    try {
      await onLogin(loginForm);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    if (
      !registerForm.name ||
      !registerForm.email ||
      !registerForm.password ||
      !registerForm.phone
    ) {
      setError("Please complete all registration fields.");
      return;
    }
    if (registerForm.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      await onRegister(registerForm);
      setRegisterForm(initialRegister);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-gate">
      <GlassCard className="auth-gate__card">
        <SectionHeading eyebrow="Secure access" title={title} description={description} />
        <div className={allowRegister ? "auth-grid" : "stack"}>
          <form className="stack" onSubmit={handleLogin}>
            <h3>Login</h3>
            <FormField
              label="Email"
              type="email"
              value={loginForm.email}
              onChange={(event) => updateLogin("email", event.target.value)}
              placeholder="patient@clinic.local"
              required
              disabled={loading}
            />
            <FormField
              label="Password"
              type="password"
              value={loginForm.password}
              onChange={(event) => updateLogin("password", event.target.value)}
              placeholder="password"
              required
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>

          {allowRegister ? (
            <form className="stack" onSubmit={handleRegister}>
              <h3>Create account</h3>
              <FormField
                label="Full name"
                value={registerForm.name}
                onChange={(event) => updateRegister("name", event.target.value)}
                placeholder="Ayse Yilmaz"
                required
                disabled={loading}
              />
              <FormField
                label="Email"
                type="email"
                value={registerForm.email}
                onChange={(event) => updateRegister("email", event.target.value)}
                placeholder="ayse@example.com"
                required
                disabled={loading}
              />
              <FormField
                label="Phone"
                value={registerForm.phone}
                onChange={(event) => updateRegister("phone", event.target.value)}
                placeholder="+905550000000"
                required
                disabled={loading}
              />
              <FormField
                label="Password"
                type="password"
                value={registerForm.password}
                onChange={(event) => updateRegister("password", event.target.value)}
                placeholder="Min. 8 characters"
                required
                disabled={loading}
              />
              <Button type="submit" variant="secondary" disabled={loading}>
                {loading ? "Creating..." : "Register"}
              </Button>
            </form>
          ) : null}
        </div>
        {error ? <p className="form-message form-message--error">{error}</p> : null}
      </GlassCard>
    </div>
  );
}
