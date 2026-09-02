"use client";

import { useEffect, useRef, useState } from "react";

const EDGE_TOLERANCE = 2;
const STAGE_SCROLL_DISTANCE = 290;
const TOTAL_STAGES = 7;

export default function AdmissionsBoardScrollControls({ targetRef }) {
  const trackRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ pointerX: 0, initialScrollLeft: 0, trackWidth: 0, thumbWidth: 0, maxScroll: 0 });

  const [metrics, setMetrics] = useState({
    hasOverflow: false,
    atStart: true,
    atEnd: false,
    scrollProgress: 0, // 0 to 1
    thumbWidthPercent: 25, // percentage of track
  });

  useEffect(() => {
    const target = targetRef?.current;
    if (!target) return undefined;

    const measure = () => {
      const maxScroll = Math.max(0, target.scrollWidth - target.clientWidth);
      const hasOverflow = maxScroll > EDGE_TOLERANCE;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, target.scrollLeft / maxScroll)) : 0;
      const thumbWidthPercent = target.scrollWidth > 0
        ? Math.max(12, Math.min(100, (target.clientWidth / target.scrollWidth) * 100))
        : 100;

      setMetrics({
        hasOverflow,
        atStart: target.scrollLeft <= EDGE_TOLERANCE,
        atEnd: target.scrollLeft >= maxScroll - EDGE_TOLERANCE,
        scrollProgress: progress,
        thumbWidthPercent,
      });
    };

    const handleScroll = () => {
      measure();
    };

    const observer = new ResizeObserver(measure);
    observer.observe(target);
    if (target.firstElementChild) {
      observer.observe(target.firstElementChild);
    }
    target.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", measure);
    measure();

    return () => {
      observer.disconnect();
      target.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", measure);
    };
  }, [targetRef]);

  const move = (direction) => {
    const target = targetRef.current;
    if (!target) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollBy({
      left: direction * STAGE_SCROLL_DISTANCE,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const handleTrackPointerDown = (event) => {
    const target = targetRef.current;
    const track = trackRef.current;
    if (!target || !track) return;

    const rect = track.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const maxScroll = Math.max(0, target.scrollWidth - target.clientWidth);
    if (maxScroll <= 0) return;

    const thumbWidthPx = (metrics.thumbWidthPercent / 100) * rect.width;
    const availableTrack = rect.width - thumbWidthPx;
    if (availableTrack <= 0) return;

    // Center the thumb at the clicked position
    const targetThumbLeft = Math.max(0, Math.min(availableTrack, clickX - thumbWidthPx / 2));
    const targetRatio = targetThumbLeft / availableTrack;
    target.scrollLeft = targetRatio * maxScroll;
  };

  const handleThumbPointerDown = (event) => {
    event.stopPropagation();
    const target = targetRef.current;
    const track = trackRef.current;
    if (!target || !track) return;

    const rect = track.getBoundingClientRect();
    const maxScroll = Math.max(0, target.scrollWidth - target.clientWidth);
    const thumbWidthPx = (metrics.thumbWidthPercent / 100) * rect.width;

    isDraggingRef.current = true;
    dragStartRef.current = {
      pointerX: event.clientX,
      initialScrollLeft: target.scrollLeft,
      trackWidth: rect.width,
      thumbWidth: thumbWidthPx,
      maxScroll,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleThumbPointerMove = (event) => {
    if (!isDraggingRef.current) return;
    const target = targetRef.current;
    if (!target) return;

    const { pointerX, initialScrollLeft, trackWidth, thumbWidth, maxScroll } = dragStartRef.current;
    const availableTrack = trackWidth - thumbWidth;
    if (availableTrack <= 0 || maxScroll <= 0) return;

    const deltaX = event.clientX - pointerX;
    const scrollDelta = (deltaX / availableTrack) * maxScroll;
    target.scrollLeft = Math.max(0, Math.min(maxScroll, initialScrollLeft + scrollDelta));
  };

  const handleThumbPointerUp = (event) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Safe fallback if pointer capture was lost
      }
    }
  };

  const handleKeyDown = (event) => {
    const target = targetRef.current;
    if (!target) return;
    const maxScroll = Math.max(0, target.scrollWidth - target.clientWidth);

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        move(-1);
        break;
      case "ArrowRight":
        event.preventDefault();
        move(1);
        break;
      case "Home":
        event.preventDefault();
        target.scrollTo({ left: 0, behavior: "smooth" });
        break;
      case "End":
        event.preventDefault();
        target.scrollTo({ left: maxScroll, behavior: "smooth" });
        break;
      case "PageUp":
        event.preventDefault();
        target.scrollBy({ left: -target.clientWidth, behavior: "smooth" });
        break;
      case "PageDown":
        event.preventDefault();
        target.scrollBy({ left: target.clientWidth, behavior: "smooth" });
        break;
      default:
        break;
    }
  };

  if (!metrics.hasOverflow) return null;

  // Compute thumb position in percentage (0% to (100 - thumbWidthPercent)%)
  const availableTrackPercent = 100 - metrics.thumbWidthPercent;
  const thumbLeftPercent = metrics.scrollProgress * availableTrackPercent;

  return (
    <nav className="admissions-board-scroll-controls" aria-label="Scroll admissions workflow stages">
      <button
        type="button"
        className="admissions-board-nav-arrow"
        aria-label="View earlier admissions stages"
        disabled={metrics.atStart}
        onClick={() => move(-1)}
      >
        <span aria-hidden="true">←</span>
      </button>

      <div
        className="admissions-board-top-scroll"
        ref={trackRef}
        role="scrollbar"
        tabIndex={0}
        aria-label="Horizontal admissions stage scrollbar"
        aria-controls="admissions-board-scroll"
        aria-orientation="horizontal"
        aria-valuenow={Math.round(metrics.scrollProgress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        onPointerDown={handleTrackPointerDown}
        onKeyDown={handleKeyDown}
      >
        {/* Visual stage tick indicators */}
        <div className="admissions-board-track-ticks" aria-hidden="true">
          {Array.from({ length: TOTAL_STAGES }).map((_, index) => (
            <span
              key={index}
              className="admissions-board-track-tick"
              style={{ left: `${(index / (TOTAL_STAGES - 1)) * 100}%` }}
            />
          ))}
        </div>

        {/* Prominent draggable thumb pill */}
        <div
          className="admissions-board-scroll-thumb"
          style={{
            width: `${metrics.thumbWidthPercent}%`,
            left: `${thumbLeftPercent}%`,
          }}
          onPointerDown={handleThumbPointerDown}
          onPointerMove={handleThumbPointerMove}
          onPointerUp={handleThumbPointerUp}
          onPointerCancel={handleThumbPointerUp}
        >
          <span className="admissions-board-thumb-grip" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </div>
      </div>

      <button
        type="button"
        className="admissions-board-nav-arrow"
        aria-label="View later admissions stages"
        disabled={metrics.atEnd}
        onClick={() => move(1)}
      >
        <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}
