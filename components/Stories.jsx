"use client";

import { useRef } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";
import { useSiteContent } from "@/components/cms/SiteContentContext";

export default function Stories() {
  const content = useSiteContent();
  const ref = useRef(null);
  useScrollReveal(ref, "[data-reveal]", { stagger: 0.15, y: 32, start: "top 88%" });

  const STORIES = Array.from({ length: 10 }, (_, index) => {
    const slot = index + 1;
    const name = content[`stories.${slot}.name`];
    return {
      name,
      initial: name?.charAt(0) || "",
      meta: content[`stories.${slot}.date`],
      image: content[`stories.${slot}.image`],
      quote: content[`stories.${slot}.quote`],
    };
  }).filter((story) => story.name && story.quote);

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
              <div className="story-media">
                {s.image ? (
                  <img src={s.image} alt={`${s.name}, Faith Haven House graduate`} />
                ) : (
                  <span className="story-media-placeholder" aria-hidden="true">{s.initial}</span>
                )}
              </div>
              <div className="story-content">
                <div className="story-meta">
                  <div className="story-info">
                    <h4>{s.name}</h4>
                    <span>{s.meta}</span>
                  </div>
                </div>
                <span className="story-quote-mark" aria-hidden="true">&ldquo;</span>
                <p className="story-body">{s.quote}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
