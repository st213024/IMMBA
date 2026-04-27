import type { MethodStep } from "@/data/homepageData";
import { SectionShell } from "@/components/ui/SectionShell";

type TeachingMethodSectionProps = {
  steps: MethodStep[];
};

export function TeachingMethodSection({ steps }: TeachingMethodSectionProps) {
  return (
    <SectionShell id="teaching-method" title="我的帶領方式">
      <div className="card-grid cols-4">
        {steps.map((step, index) => (
          <article className="card" key={step.title}>
            <span className="step-index">0{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.detail}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
