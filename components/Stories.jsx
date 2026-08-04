"use client";

import { useRef, useState } from "react";
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

function getStoryPreview(text, maxLength = 460) {
  if (text.length <= maxLength) return text;
  const preview = text.slice(0, maxLength);
  const finalSpace = preview.lastIndexOf(" ");
  return `${preview.slice(0, finalSpace)}…`;
}

export default function Stories({ standalone = false, compact = false }) {
  const content = useSiteContent();
  const ref = useRef(null);
  const [expandedStories, setExpandedStories] = useState(() => new Set());
  const useCompactLayout = standalone || compact;
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
  const ORDERED_STORIES = [
    ...STORIES.filter((story) => story.quote.length > 280),
    ...STORIES.filter((story) => story.quote.length <= 280),
  ];

  const SectionHeading = standalone ? "h1" : "h2";
  const StoryHeading = standalone ? "h2" : "h3";

  function toggleStory(index) {
    setExpandedStories((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <section
      className={`stories-section${useCompactLayout ? " stories-section--compact" : ""}${standalone ? " stories-section--standalone" : ""}`}
      id="stories"
      ref={ref}
    >
      <div className="container">
        <div className="stories-intro" data-reveal>
          <div className="section-header">
            <span className="section-eyebrow">Stories of Restoration</span>
            <SectionHeading className="section-title">Success Graduates</SectionHeading>
            <p className="section-subtitle">
              Real accounts from the men Faith Haven House has walked alongside.
            </p>
          </div>
          {useCompactLayout && (
            <div className="stories-count" aria-label={`${STORIES.length} graduate stories`}>
              <strong>{STORIES.length}</strong>
              <span>Graduate stories</span>
            </div>
          )}
        </div>

        <div className={`stories-grid${useCompactLayout ? " stories-grid--compact" : ""}`}>
          {ORDERED_STORIES.map((s, index) => {
            const isExpanded = expandedStories.has(index);
            const isLongStory = s.quote.length > 280;
            const storyBodyId = `story-${index + 1}-body`;
            const visibleStory = useCompactLayout && !isExpanded
              ? getStoryPreview(s.quote)
              : s.quote;

            return (
              <article
                className={`story-card${useCompactLayout ? " story-card--compact" : ""}${isExpanded ? " story-card--expanded" : ""}`}
                key={`${s.name}-${index}`}
                data-reveal
              >
                <div className="story-media">
                  {s.image ? (
                    <img
                      className={s.name === "Devon" ? "story-media-img--devon" : undefined}
                      src={s.image}
                      alt={`${s.name}, Faith Haven House graduate`}
                      loading={index < 3 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  ) : (
                    <span className="story-media-placeholder" aria-hidden="true">{s.initial}</span>
                  )}
                  {useCompactLayout && <span className="story-graduate-badge">Graduate</span>}
                </div>
                <div className="story-content">
                  <div className="story-meta">
                    <div className="story-info">
                      <StoryHeading>{s.name}</StoryHeading>
                      {s.meta && <span>{s.meta}</span>}
                    </div>
                  </div>
                  <span className="story-quote-mark" aria-hidden="true">&ldquo;</span>
                  <p className="story-body" id={storyBodyId}>{renderStoryText(visibleStory, s.name)}</p>
                  {useCompactLayout && isLongStory && (
                    <button
                      className="story-toggle"
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={storyBodyId}
                      onClick={() => toggleStory(index)}
                    >
                      <span>{isExpanded ? "Show less" : "Read full story"}</span>
                      <svg viewBox="0 0 20 20" aria-hidden="true">
                        <path d="m6.5 8 3.5 3.5L13.5 8" />
                      </svg>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
