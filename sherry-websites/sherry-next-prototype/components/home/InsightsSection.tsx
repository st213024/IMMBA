import type { Insight } from "@/data/homepageData";
import { SectionShell } from "@/components/ui/SectionShell";

type InsightsSectionProps = {
  insights: Insight[];
};

export function InsightsSection({ insights }: InsightsSectionProps) {
  return (
    <SectionShell
      id="insights"
      title="觀點與內容"
      subtitle="關於課程設計、創作、療癒、生涯整理與跨域實踐的一些思考與紀錄。"
    >
      <div className="card-grid cols-3">
        {insights.map((post) => (
          <article className="card" key={post.title}>
            <span className="tag">{post.category}</span>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <a className="text-link" href={post.action.href}>
              {post.action.label}
            </a>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
