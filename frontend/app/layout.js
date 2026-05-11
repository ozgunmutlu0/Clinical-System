import "./globals.css";

export const metadata = {
  title: "Clinical Appointment System",
  description: "Full-stack clinical appointment booking platform"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
