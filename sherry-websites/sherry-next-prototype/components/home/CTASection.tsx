type CTASectionProps = {
  title: string;
  description: string;
  actions: { label: string; href: string }[];
};

export function CTASection({ title, description, actions }: CTASectionProps) {
  return (
    <section id="cta" className="cta-section">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="hero-actions">
        {actions.map((action, index) => (
          <a className={`btn ${index === 0 ? "btn-primary" : "btn-ghost"}`} key={action.label} href={action.href}>
            {action.label}
          </a>
        ))}
      </div>
    </section>
  );
}
