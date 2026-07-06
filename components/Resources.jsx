"use client";

import { useRef } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";

const RESOURCES = [
  {
    icon: "/assets/icon_restoration.png",
    title: "Meal Train Support",
    desc: "Community members supply nightly hot meals for Faith Haven House residents through our dedicated online Meal Train.",
    linkText: "Sign Up For Meal Train →",
    linkUrl: "https://www.mealtrain.com/trains/yq254l",
  },
  {
    icon: "/assets/icon_homeownership.png",
    title: "Housing & Rebuilding Guidance",
    desc: "Information and referrals for emergency shelter pre-screening, transitional housing, and long-term lease programs.",
    linkText: "View Program Roadmap →",
    linkUrl: "#roadmap",
  },
  {
    icon: "/assets/icon_empowerment.png",
    title: "Volunteer & Mentor SOP",
    desc: "Detailed guidelines for Daytime House Monitors, life skills coaches, and men's mentorship programs.",
    linkText: "Explore Volunteer SOP →",
    linkUrl: "#volunteer",
  },
];

export default function Resources() {
  const ref = useRef(null);
  useScrollReveal(ref, "[data-reveal]", { stagger: 0.12, y: 28 });

  return (
    <section className="resources-section" id="resources" ref={ref}>
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="section-eyebrow">Support &amp; Guidance</span>
          <h2 className="section-title">Community Resources</h2>
          <p className="section-subtitle">
            Essential tools, partner networks, and support options for residents, families, and volunteers.
          </p>
        </div>

        <div className="resources-grid">
          {RESOURCES.map((r) => (
            <div className="resource-card" key={r.title} data-reveal>
              <img src={r.icon} alt={r.title} className="resource-icon" />
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
              <a href={r.linkUrl} className="resource-link" target={r.linkUrl.startsWith("http") ? "_blank" : "_self"} rel="noopener">
                {r.linkText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
