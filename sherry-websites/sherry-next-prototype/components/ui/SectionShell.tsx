import type { ReactNode } from "react";

type SectionShellProps = {
  id?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function SectionShell({ id, title, subtitle, children }: SectionShellProps) {
  return (
    <section id={id} className="section-shell">
      <div className="section-head">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
