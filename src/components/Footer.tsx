import Link from "next/link";
import { store } from "@/config/store";

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <p className="wordmark">{store.name}</p>
        <p className="muted">{store.description}</p>
      </div>
      <nav aria-label="Footer">
        {store.nav.map((l) => (
          <Link key={l.label} href={l.href}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="muted">
        <p>
          <a href={`mailto:${store.contact.email}`}>{store.contact.email}</a>
        </p>
        <p>{store.contact.phone}</p>
        <p>
          © {new Date().getFullYear()} {store.name}
        </p>
      </div>
    </footer>
  );
}
