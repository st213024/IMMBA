type FooterProps = {
  tagline: string;
  quickLinks: string[];
  courseTopics: string[];
  collaborations: string[];
  email: string;
  socials: string[];
  copyright: string;
};

export function Footer({ tagline, quickLinks, courseTopics, collaborations, email, socials, copyright }: FooterProps) {
  return (
    <footer className="site-footer">
      <p>{tagline}</p>
      <div className="footer-grid">
        <div>
          <h4>快速導覽</h4>
          <p>{quickLinks.join(" / ")}</p>
        </div>
        <div>
          <h4>課程主題</h4>
          <p>{courseTopics.join(" / ")}</p>
        </div>
        <div>
          <h4>合作方案</h4>
          <p>{collaborations.join(" / ")}</p>
        </div>
      </div>
      <p>Email: {email}</p>
      <p>社群：{socials.join(" / ")}</p>
      <small>{copyright}</small>
    </footer>
  );
}
