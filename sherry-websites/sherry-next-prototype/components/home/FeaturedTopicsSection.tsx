import type { TopicCard } from "@/data/homepageData";
import { SectionShell } from "@/components/ui/SectionShell";

type FeaturedTopicsSectionProps = {
  topics: TopicCard[];
};

export function FeaturedTopicsSection({ topics }: FeaturedTopicsSectionProps) {
  return (
    <SectionShell
      id="featured-topics"
      title="精選課程主題"
      subtitle="以引導、體驗、整理與實踐為核心，發展多元主題的課程、講座與工作坊。"
    >
      <div className="card-grid cols-4">
        {topics.map((topic) => (
          <article className="card" key={topic.title}>
            <h3>{topic.title}</h3>
            <p>{topic.summary}</p>
            <a className="text-link" href={topic.action.href}>
              {topic.action.label}
            </a>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
