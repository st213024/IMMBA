import type { NavItem } from "@/data/homepageData";

type HeaderProps = {
  brandName: string;
  navItems: NavItem[];
  actions: { label: string; href: string }[];
};

export function Header({ brandName, navItems, actions }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="container header-row">
        <a className="brand-mark" href="#">
          {brandName}
        </a>
        <nav aria-label="Primary">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.label}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-actions">
          {actions.map((action, index) => (
            <a className={`btn ${index === 0 ? "btn-ghost" : "btn-primary"}`} key={action.label} href={action.href}>
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
