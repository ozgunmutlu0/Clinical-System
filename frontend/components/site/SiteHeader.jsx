"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearAuth, getAuth } from "@/lib/auth";

export function SiteHeader() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  function logout() {
    clearAuth();
    setAuth(null);
    window.location.href = "/patient";
  }

  return (
    <header className="site-header">
      <Link href="/" className="site-header__brand">
        Clinical Appointments
      </Link>
      <nav className="site-header__nav">
        <Link href="/">Home</Link>
        <Link href="/patient">Book Appointment</Link>
        <Link href="/doctor">Doctor</Link>
        <Link href="/admin">Admin</Link>
      </nav>
      <div className="site-header__meta">
        {auth ? (
          <>
            <span className="site-header__user">
              {auth.name} ({auth.role})
            </span>
            <button type="button" className="table-action" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/patient" className="button-link button-link--primary">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
