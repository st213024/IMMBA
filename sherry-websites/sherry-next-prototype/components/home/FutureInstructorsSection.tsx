type FutureInstructorsSectionProps = {
  data: {
    title: string;
    description: string;
    sherryCard: { name: string; role: string; note: string; image: string };
    comingSoon: { title: string; note: string };
  };
};

export function FutureInstructorsSection({ data }: FutureInstructorsSectionProps) {
  return (
    <section id="future-instructors" className="section-shell">
      <div className="section-head">
        <h2>{data.title}</h2>
        <p>{data.description}</p>
      </div>
      <div className="future-grid">
        <article className="card future-speaker">
          <img src={data.sherryCard.image} alt={data.sherryCard.name} />
          <div>
            <h3>{data.sherryCard.name}</h3>
            <p>{data.sherryCard.role}</p>
            <strong>{data.sherryCard.note}</strong>
          </div>
        </article>
        <div className="future-placeholder">
          <h3>{data.comingSoon.title}</h3>
          <p>{data.comingSoon.note}</p>
        </div>
      </div>
    </section>
  );
}
