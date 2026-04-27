import type { HeroData } from "@/data/homepageData";

type HeroSectionProps = {
  hero: HeroData;
};

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow">Speaker-first course brand</p>
        <h1>{hero.title}</h1>
        <p className="hero-description">{hero.description}</p>
        <div className="hero-actions">
          {hero.primaryActions.map((action) => (
            <a className="btn btn-primary" key={action.label} href={action.href}>
              {action.label}
            </a>
          ))}
        </div>
        <div className="hero-actions hero-actions-secondary">
          {hero.secondaryActions.map((action) => (
            <a className="btn btn-ghost" key={action.label} href={action.href}>
              {action.label}
            </a>
          ))}
        </div>
      </div>
      <div className="hero-portrait-wrap">
        <img className="hero-portrait" src={hero.image} alt="Sherry portrait" />
      </div>
    </section>
  );
}
