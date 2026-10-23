"use client";

import Link from "next/link";
import { useState } from "react";
import { store } from "@/config/store";
import { useStore } from "./StoreProvider";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "./Icons";

export function Header() {
  const { count, setCartOpen, setSearchOpen } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="utility-bar">
        <nav aria-label="Utility">
          {store.utilityLinks.map((l) => (
            <Link key={l.label} href={l.href}>
              {l.label}
            </Link>
          ))}
          <Link href="/contact">Sign In</Link>
        </nav>
      </div>

      <div className="main-bar">
        <Link href="/" className="brand" aria-label={`${store.name} home`}>
          {store.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logo} alt={store.name} />
          ) : (
            <span className="wordmark">{store.name}</span>
          )}
        </Link>

        <nav className={`main-nav${menuOpen ? " open" : ""}`} aria-label="Main">
          {store.nav.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button className="search-pill" onClick={() => setSearchOpen(true)} aria-label="Search products">
            <SearchIcon />
            <span>Search</span>
          </button>
          <Link href="/contact" className="icon-btn" aria-label="Account">
            <UserIcon />
          </Link>
          <button className="icon-btn cart-btn" onClick={() => setCartOpen(true)} aria-label={`Open cart, ${count} items`}>
            <BagIcon />
            {count > 0 && <span className="badge">{count}</span>}
          </button>
          <button className="icon-btn menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" aria-expanded={menuOpen}>
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
