import { SectionShell } from "@/components/ui/SectionShell";

type TopicTagsSectionProps = {
  tags: { label: string; href: string }[];
};

export function TopicTagsSection({ tags }: TopicTagsSectionProps) {
  return (
    <SectionShell id="topic-explore" title="探索更多主題">
      <div className="tag-list">
        {tags.map((tag) => (
          <a className="tag-pill" key={tag.label} href={tag.href}>
            {tag.label}
          </a>
        ))}
      </div>
    </SectionShell>
  );
}
