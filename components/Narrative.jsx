"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const HIGHLIGHT = /re-building|rebuilding|transition|yes|support|network|physical|spiritual/i;

export default function Narrative({ id, text, cardBg = false }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;

    const normalWords    = section.querySelectorAll(".narrative-word:not(.highlight)");
    const highlightWords = section.querySelectorAll(".narrative-word.highlight");

    gsap.set(normalWords,    { opacity: 0.25 });
    gsap.set(highlightWords, { opacity: 0.25 });

    const tween = gsap.to([...normalWords, ...highlightWords], {
      opacity: 1,
      stagger: 0.03,
      ease: "power1.out",
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        end: "bottom 45%",
        scrub: 0.5,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const wordList = text.trim().split(/\s+/);

  return (
    <section
      className={`narrative-container${cardBg ? " narrative-container--card" : ""}`}
      id={id}
      ref={sectionRef}
    >
      <div className="container">
        <p className="narrative-text">
          {wordList.map((word, i) => {
            const clean = word.replace(/[^a-zA-Z-]/g, "");
            return (
              <span
                key={i}
                className={HIGHLIGHT.test(clean) ? "narrative-word highlight" : "narrative-word"}
              >
                {word}{" "}
              </span>
            );
          })}
        </p>
      </div>
    </section>
  );
}
