import type { CaseStudy } from "@/data/homepageData";
import { SectionShell } from "@/components/ui/SectionShell";

type CaseStudiesSectionProps = {
  caseStudies: CaseStudy[];
};

export function CaseStudiesSection({ caseStudies }: CaseStudiesSectionProps) {
  return (
    <SectionShell
      id="case-studies"
      title="精選課程成果"
      subtitle="從課程設計到帶領執行，每一次合作都希望留下真正有感、可延伸、可實踐的成果。"
    >
      <div className="card-grid cols-4">
        {caseStudies.map((item) => (
          <article className="card" key={item.name}>
            <h3>{item.name}</h3>
            <p>對象類型：{item.targetType}</p>
            <p>課程形式：{item.format}</p>
            <p>主題分類：{item.category}</p>
            <strong>{item.highlight}</strong>
            <a className="text-link" href={item.action.href}>
              {item.action.label}
            </a>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
