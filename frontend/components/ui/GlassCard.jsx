export function GlassCard({ children, className = "" }) {
  return <article className={`glass-card ${className}`.trim()}>{children}</article>;
}
