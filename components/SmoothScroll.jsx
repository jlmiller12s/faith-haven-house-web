"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      // Lower duration = snappier feel (0.8–1.0 is natural, 1.2+ feels slow)
      duration: 0.9,
      easing: (t) => 1 - Math.pow(1 - t, 4), // ease-out-quart: quick start, smooth stop
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.2, // slightly more scroll distance per wheel tick
      touchMultiplier: 2,
      infinite: false,
    });

    window.lenis = lenis;

    // Feed Lenis scroll position into ScrollTrigger every frame
    lenis.on("scroll", ScrollTrigger.update);

    // GSAP provides seconds; Lenis's RAF clock expects milliseconds.
    function onTick(time) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Refresh scroll triggers after layout settles
    const t1 = setTimeout(() => ScrollTrigger.refresh(), 300);
    const t2 = setTimeout(() => ScrollTrigger.refresh(), 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return null;
}
