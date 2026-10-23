import type { Metadata } from "next";
import { store } from "@/config/store";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const c = store.contact;
  return (
    <section className="page narrow">
      <p className="eyebrow">
        <span>Contact</span>
      </p>
      <h1 className="page-title">We&apos;d love to hear from you.</h1>
      <dl className="contact-list">
        <div>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${c.email}`}>{c.email}</a>
          </dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>
            <a href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a>
          </dd>
        </div>
        <div>
          <dt>Store</dt>
          <dd>{c.address}</dd>
        </div>
        <div>
          <dt>Hours</dt>
          <dd>{c.hours}</dd>
        </div>
        <div>
          <dt>Instagram</dt>
          <dd>
            <a href={c.instagram} target="_blank" rel="noreferrer">
              {c.instagram.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
          </dd>
        </div>
      </dl>
    </section>
  );
}
