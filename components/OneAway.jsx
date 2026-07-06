"use client";

import { useRef } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";

export default function OneAway() {
  const ref = useRef(null);
  useScrollReveal(ref, "[data-reveal]", { stagger: 0.12, y: 28 });

  return (
    <section className="oneaway-section" id="one-away" ref={ref}>
      <div className="container">
        <div className="oneaway-card" data-reveal>
          <div className="oneaway-content">
            <span className="section-eyebrow" style={{ color: "var(--color-terracotta)" }}>
              A Perspective on Homelessness
            </span>
            <h2 className="oneaway-title">One Life Event Away</h2>
            <p className="oneaway-desc">
              In St. Charles County, homelessness among single men rarely happens overnight. Most residents at Faith Haven House are good, hardworking men who found themselves just <strong>one crisis away</strong> — one sudden illness, one job loss, one family tragedy, or one broken relationship away from losing their shelter.
            </p>

            <div className="oneaway-highlights">
              <div className="oneaway-pill">
                <span className="oneaway-num">01</span>
                <div>
                  <h4>No Existing Shelter</h4>
                  <p>In a county of 400,000 residents, Faith Haven House is the only shelter dedicated to single men.</p>
                </div>
              </div>
              <div className="oneaway-pill">
                <span className="oneaway-num">02</span>
                <div>
                  <h4>A Bridge, Not a Handout</h4>
                  <p>We provide immediate lodging alongside the accountability needed to achieve self-sufficiency.</p>
                </div>
              </div>
              <div className="oneaway-pill">
                <span className="oneaway-num">03</span>
                <div>
                  <h4>Individual Care</h4>
                  <p>Every resident receives direct guidance, life skills coaching, and permanent housing placement.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
