"use client";

import { useRef } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";

const VALUES = [
  { icon: "/assets/icon_faith.png",         alt: "Faith Icon",         name: "Faith" },
  { icon: "/assets/icon_hope.png",          alt: "Hope Icon",          name: "Hope" },
  { icon: "/assets/icon_restoration.png",   alt: "Restoration Icon",   name: "Restoration" },
  { icon: "/assets/icon_accountability.png",alt: "Accountability Icon", name: "Accountability" },
  { icon: "/assets/icon_empowerment.png",   alt: "Empowerment Icon",   name: "Empowerment" },
  { icon: "/assets/icon_homeownership.png", alt: "Homeownership Icon", name: "Homeownership" },
];

export default function Values() {
  const ref = useRef(null);
  useScrollReveal(ref, "[data-reveal]", { stagger: 0.08, y: 20, start: "top 90%" });

  return (
    <section className="values-section" ref={ref}>
      <div className="container">
        <div className="values-grid">
          {VALUES.map((v) => (
            <div className="value-card" key={v.name} data-reveal>
              <img src={v.icon} alt={v.alt} />
              <h3>{v.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
