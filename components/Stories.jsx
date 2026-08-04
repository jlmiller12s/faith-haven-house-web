"use client";

import { useRef } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";
import { useSiteContent } from "@/components/cms/SiteContentContext";

const STORY_EMPHASIS = {
  Eric: {
    strong: ["36 days", "full‑time job", "permanent housing"],
    em: ["First Step Back Home"],
  },
  Devon: {
    strong: ["one month", "smiling", "laughing", "working in a field he enjoys", "living in a stable place"],
    em: [],
  },
};

function renderStoryText(text, name) {
  const emphasis = STORY_EMPHASIS[name];
  if (!emphasis) return text;
  const phrases = [...emphasis.strong, ...emphasis.em];
  const escaped = phrases.map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "g");
  const strong = new Set(emphasis.strong);
  const italic = new Set(emphasis.em);

  return text.split(pattern).map((part, index) => {
    if (strong.has(part)) return <strong key={`${part}-${index}`}>{part}</strong>;
    if (italic.has(part)) return <em key={`${part}-${index}`}>{part}</em>;
    return part;
  });
}

export default function Stories() {
  const content = useSiteContent();
  const ref = useRef(null);
  useScrollReveal(ref, "[data-reveal]", { stagger: 0.15, y: 32, start: "top 88%" });

  const STORIES = Array.from({ length: 12 }, (_, index) => {
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
                    {s.meta && <span>{s.meta}</span>}
                  </div>
                </div>
                <span className="story-quote-mark" aria-hidden="true">&ldquo;</span>
                <p className="story-body">{renderStoryText(s.quote, s.name)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
