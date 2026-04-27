import type { Collaboration } from "@/data/homepageData";
import { SectionShell } from "@/components/ui/SectionShell";

type CollaborationSectionProps = {
  collaborations: Collaboration[];
};

export function CollaborationSection({ collaborations }: CollaborationSectionProps) {
  return (
    <SectionShell
      id="collaboration"
      title="合作方案"
      subtitle="依不同場域與需求，提供可調整、可整合的課程與合作形式。"
    >
      <div className="card-grid cols-4">
        {collaborations.map((item) => (
          <article className="card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <a className="text-link" href={item.action.href}>
              {item.action.label}
            </a>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
