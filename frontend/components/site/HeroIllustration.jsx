export function HeroIllustration() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <div className="hero-visual__bubble hero-visual__bubble--small" />
      <div className="hero-visual__bubble hero-visual__bubble--large" />
      <div className="hero-visual__doctor">
        <div className="hero-visual__head" />
        <div className="hero-visual__body" />
        <div className="hero-visual__tablet" />
      </div>
      <div className="hero-visual__patient">
        <div className="hero-visual__patient-head" />
        <div className="hero-visual__patient-body" />
        <div className="hero-visual__calendar">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
