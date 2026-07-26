"use client";

import { useEffect, useState } from "react";
import styles from "./coming-soon.module.css";

const LAUNCH_TIME = new Date("2026-08-03T05:01:00.000Z").getTime();

function getTimeLeft() {
  const difference = Math.max(0, LAUNCH_TIME - Date.now());

  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
    complete: difference === 0,
  };
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const update = () => setTimeLeft(getTimeLeft());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const values = timeLeft ?? {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    complete: false,
  };

  if (values.complete) {
    return (
      <div className={styles.arrived} role="status">
        Our new website is here.
      </div>
    );
  }

  return (
    <div
      className={styles.countdown}
      aria-label="Countdown to August 3, 2026 at 12:01 a.m. Central Daylight Time"
      aria-live="off"
    >
      {[
        ["days", values.days],
        ["hours", values.hours],
        ["minutes", values.minutes],
        ["seconds", values.seconds],
      ].map(([label, value]) => (
        <div className={styles.unit} key={label}>
          <strong>{String(value).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
