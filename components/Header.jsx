"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    submenu: [
      { label: "About Us", href: "/about" },
      { label: "In Loving Memory of Dareth Jeffers", href: "/about/dareth-jeffers" },
      { label: "FAQ", href: "/about/faq" },
    ],
  },
  { label: "Roadmap", href: "/roadmap" },
  {
    label: "Get Help",
    href: "/get-help",
    submenu: [
      { label: "Initial Pre-Screen", href: "/get-help" },
      { label: "Admissions Process", href: "/admissions" },
    ],
  },
  { label: "Volunteer", href: "/volunteer" },
  { label: "Stories", href: "/stories" },
  { label: "One Away", href: "/one-away" },
  { label: "Resources", href: "/resources" },
  { label: "Partners", href: "/partners" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const DONATE_URL =
  "https://www.zeffy.com/en-US/embed/donation-form/donate-to-make-a-difference-13369?modal=true";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const timeoutRef = useRef(null);
  const pathname = usePathname();

  const handleMouseEnter = (label) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 220); // 220ms grace period so mouse movement down never closes dropdown
  };

  const handleLinkClick = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(null);
  };

  return (
    <>
      <div className="floating-header-wrapper">
        <header className="floating-header">
          <Link href="/" className="header-brand">
            <img
              src="/assets/FHH-logo-clean.png"
              alt="Faith Haven House"
              style={{ height: "2.5rem", width: "auto", objectFit: "contain" }}
            />
          </Link>

          <nav className="header-nav">
            {NAV_ITEMS.filter((item) => item.label !== "Home").map((item) => {
              if (item.submenu) {
                const isSubActive = item.submenu.some(
                  (sub) => pathname === sub.href
                );
                return (
                  <div
                    key={item.label}
                    className="nav-dropdown-wrapper"
                    onMouseEnter={() => handleMouseEnter(item.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={item.href}
                      className={`nav-dropdown-trigger${
                        isSubActive ? " active" : ""
                      }`}
                    >
                      {item.label}
                      <span className="dropdown-caret" aria-hidden="true">
                        ▾
                      </span>
                    </Link>

                    {openDropdown === item.label && (
                      <div
                        className="nav-dropdown-menu"
                        onMouseEnter={() => handleMouseEnter(item.label)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {item.submenu.map((sub) => {
                          const isActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              className={`nav-dropdown-item${
                                isActive ? " active" : ""
                              }`}
                              onClick={handleLinkClick}
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={isActive ? "active" : ""}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="header-actions">
            <a
              href={DONATE_URL}
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Donate
            </a>

            <button
              className={`hamburger-btn${mobileOpen ? " active" : ""}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Navigation"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </header>
      </div>

      {/* Full-Screen Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-menu-drawer open">
          <div className="mobile-menu-inner">
            <ul className="mobile-menu-list">
              {NAV_ITEMS.map((item) => {
                if (item.submenu) {
                  return (
                    <li key={item.label} className="mobile-menu-has-sub">
                      <Link
                        href={item.href}
                        className={`mobile-menu-parent-link${
                          pathname === item.href ? " active" : ""
                        }`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label} ▾
                      </Link>
                      <ul className="mobile-submenu-list">
                        {item.submenu.map((sub) => (
                          <li key={sub.label}>
                            <Link
                              href={sub.href}
                              onClick={() => setMobileOpen(false)}
                              className={pathname === sub.href ? "active" : ""}
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                }
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={pathname === item.href ? "active" : ""}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mobile-menu-cta">
              <a
                href={DONATE_URL}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
              >
                Donate Today
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
