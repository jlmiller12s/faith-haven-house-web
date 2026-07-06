"use client";

import { useRef } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";

export default function Stories() {
  const ref = useRef(null);
  useScrollReveal(ref, "[data-reveal]", { stagger: 0.15, y: 32, start: "top 88%" });

  const STORIES = [
    {
      initial: "E",
      name: "Eric",
      meta: "Graduate — January 14, 2023",
      quote:
        "In the 36 days that he was here, Eric was able to obtain a full-time job while continuing to drive for Door Dash to supplement his income. He moved into permanent housing through the First Step Back Home program! We are so happy to partner with an amazing organization to help one of our residents obtain his independence again! With God, we can do more!",
    },
    {
      initial: "D",
      name: "Devon",
      meta: "First Graduate — December 22, 2022",
      quote:
        "We had our first graduate, Devon! Devon made huge progress in the month he was with us. He came from living in a tent where he had been for quite some time. By the time he left, he was smiling and laughing, working in a field that he enjoys, and staying in a stable place. I truly believe that the men who come to us just need that extra little lift.",
    },
  ];

  return (
    <section className="stories-section" id="stories" ref={ref}>
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="section-eyebrow">Stories of Restoration</span>
          <h2 className="section-title">Success Graduates</h2>
          <p className="section-subtitle" style={{ color: "rgba(248,246,241,0.65)" }}>
            Real accounts from the men Faith Haven House has walked alongside.
          </p>
        </div>

        <div className="stories-grid">
          {STORIES.map((s) => (
            <div className="story-card" key={s.name} data-reveal>
              <span className="story-quote-mark">&ldquo;</span>
              <p className="story-body">{s.quote}</p>
              <div className="story-meta">
                <div className="story-avatar">{s.initial}</div>
                <div className="story-info">
                  <h4>{s.name}</h4>
                  <span>{s.meta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
