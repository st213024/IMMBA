import type { AboutData } from "@/data/homepageData";
import { SectionShell } from "@/components/ui/SectionShell";

type AboutSherrySectionProps = {
  about: AboutData;
};

export function AboutSherrySection({ about }: AboutSherrySectionProps) {
  return (
    <SectionShell id="about-sherry" title={about.title}>
      <div className="about-layout">
        <img className="about-image" src={about.image} alt="About Sherry" />
        <div>
          <p className="body-copy">{about.description}</p>
          <div className="tag-list">
            {about.tags.map((tag) => (
              <span className="tag-pill" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <div className="section-actions">
            {about.actions.map((action, index) => (
              <a className={`btn ${index === 0 ? "btn-primary" : "btn-ghost"}`} key={action.label} href={action.href}>
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
