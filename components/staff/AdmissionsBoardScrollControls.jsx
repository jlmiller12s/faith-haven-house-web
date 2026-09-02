"use client";

import { useEffect, useRef, useState } from "react";

const EDGE_TOLERANCE = 2;
const STAGE_SCROLL_DISTANCE = 290;

export default function AdmissionsBoardScrollControls({ targetRef }) {
  const controlRef = useRef(null);
  const syncingRef = useRef(false);
  const [state, setState] = useState({
    contentWidth: 0,
    hasOverflow: false,
    atStart: true,
    atEnd: false,
  });

  useEffect(() => {
    const target = targetRef.current;
    const control = controlRef.current;
    if (!target || !control) return undefined;

    const measure = () => {
      const maximum = Math.max(0, target.scrollWidth - target.clientWidth);
      setState({
        contentWidth: target.scrollWidth,
        hasOverflow: maximum > EDGE_TOLERANCE,
        atStart: target.scrollLeft <= EDGE_TOLERANCE,
        atEnd: target.scrollLeft >= maximum - EDGE_TOLERANCE,
      });
    };

    const finishSync = () => {
      window.requestAnimationFrame(() => {
        syncingRef.current = false;
      });
    };

    const syncFromBoard = () => {
      if (!syncingRef.current) {
        syncingRef.current = true;
        control.scrollLeft = target.scrollLeft;
        finishSync();
      }
      measure();
    };

    const syncFromControl = () => {
      if (!syncingRef.current) {
        syncingRef.current = true;
        target.scrollLeft = control.scrollLeft;
        finishSync();
      }
      measure();
    };

    const observer = new ResizeObserver(measure);
    observer.observe(target);
    if (target.firstElementChild) observer.observe(target.firstElementChild);
    target.addEventListener("scroll", syncFromBoard, { passive: true });
    control.addEventListener("scroll", syncFromControl, { passive: true });
    measure();

    return () => {
      observer.disconnect();
      target.removeEventListener("scroll", syncFromBoard);
      control.removeEventListener("scroll", syncFromControl);
    };
  }, [targetRef]);

  const move = (direction) => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    targetRef.current?.scrollBy({
      left: direction * STAGE_SCROLL_DISTANCE,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  if (!state.hasOverflow) return null;

  return (
    <nav className="admissions-board-scroll-controls" aria-label="Scroll admissions workflow stages">
      <button
        type="button"
        aria-label="View earlier admissions stages"
        disabled={state.atStart}
        onClick={() => move(-1)}
      >
        <span aria-hidden="true">←</span>
      </button>
      <div
        className="admissions-board-top-scroll"
        ref={controlRef}
        tabIndex={0}
        aria-label="Horizontal admissions stage scrollbar"
        role="region"
      >
        <div aria-hidden="true" style={{ width: `${state.contentWidth}px` }} />
      </div>
      <button
        type="button"
        aria-label="View later admissions stages"
        disabled={state.atEnd}
        onClick={() => move(1)}
      >
        <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}
