"use client";

import { useRef } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";
import { useSiteContent } from "@/components/cms/SiteContentContext";

const DONATE_URL =
  "https://www.zeffy.com/en-US/donation-form/donate-to-make-a-difference-16969";

export default function DonateBanner() {
  const content = useSiteContent();
  const ref = useRef(null);
  useScrollReveal(ref, "[data-reveal]", { stagger: 0.12, y: 24, start: "top 88%" });

  return (
    <section className="donate-banner" id="donate" ref={ref}>
      <div className="container">
        <div className="donate-banner-content" data-reveal>
          <span className="section-eyebrow">Join the Mission</span>
          <h2>{content["home.donate.title"]}</h2>
          <p>{content["home.donate.text"]}</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href={DONATE_URL} className="btn btn-primary" target="_blank" rel="noopener">
              Donate Today
            </a>
            <a href="#volunteer" className="btn btn-outline-light">
              Volunteer Instead →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
