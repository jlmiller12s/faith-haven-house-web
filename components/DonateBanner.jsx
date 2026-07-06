"use client";

import { useRef } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";

const DONATE_URL =
  "https://www.zeffy.com/en-US/embed/donation-form/donate-to-make-a-difference-13369?modal=true";

export default function DonateBanner() {
  const ref = useRef(null);
  useScrollReveal(ref, "[data-reveal]", { stagger: 0.12, y: 24, start: "top 88%" });

  return (
    <section className="donate-banner" id="donate" ref={ref}>
      <div className="container">
        <div className="donate-banner-content" data-reveal>
          <span className="section-eyebrow">Join the Mission</span>
          <h2>With God, We Can Do More</h2>
          <p>
            Any donation is accepted with nothing but kindness at our facility. Your support goes
            directly towards the empowerment, facilitation, and stable transition of every resident
            during their stay.
          </p>
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
