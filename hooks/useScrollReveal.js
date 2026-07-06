"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function useScrollReveal(
  containerRef,
  selector = "[data-reveal]",
  options = {}
) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef?.current;
    if (!container) return;

    const els = Array.from(container.querySelectorAll(selector));
    if (!els.length) return;

    const {
      y        = 40,
      duration = 0.85,
      stagger  = 0.14,
      start    = "top 88%",
      ease     = "power3.out",
    } = options;

    // Set initial hidden state before trigger fires
    gsap.set(els, { opacity: 0, y, willChange: "transform, opacity" });

    const st = ScrollTrigger.create({
      trigger: container,
      start,
      once: true,
      onEnter: () => {
        gsap.to(els, {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease,
          overwrite: "auto",
          onComplete: () => {
            // Clean up will-change after animation
            els.forEach((el) => el.style.removeProperty("will-change"));
          },
        });
      },
    });

    // Refresh after a short delay to recalculate positions
    // (needed when Lenis initialises after components mount)
    const timer = setTimeout(() => ScrollTrigger.refresh(), 150);

    return () => {
      clearTimeout(timer);
      st.kill();
    };
  }, [containerRef, selector]);
}
