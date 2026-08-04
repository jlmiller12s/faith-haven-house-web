"use client";

import { useState, useRef } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";

const TIERS = [
  { num: 3, name: "Safety & Shelter",  subtitle: "Level 3: Foundation" },
  { num: 2, name: "Support Network",   subtitle: "Level 2: The Core Network" },
  { num: 1, name: "Stable Living",     subtitle: "Level 1: Transition Peak" },
];

const CARDS = [
  {
    num: 3,
    subtitle: "Level 3: Foundation",
    title: "Access to Nutritious Meals",
    body: "Every journey forward begins with safety, nourishment, and a place to rest. Residents have food available to prepare their own meals, with occasional shared meals offered through the kindness of Meal Train volunteers. While dinner is not delivered every day, each man has a warm bed and a welcoming, highly structured, drug-free place to rest, rebuild, and move forward.",
    features: [
      { icon: "/assets/icon_restoration.png", alt: "Restoration Icon", text: "Food Available for Every Resident" },
      { icon: "/assets/icon_hope.png",        alt: "Hope Icon",        text: "A Safe, Welcoming Place to Rest" },
    ],
  },
  {
    num: 2,
    subtitle: "Level 2: The Core Network",
    title: "A Network of Support",
    body: "Residents do not walk the rebuilding path alone. We build a personalized web of care around each man — personal mentors and regular Daytime House Monitor presence to maintain order, listen, and offer spiritual encouragement.",
    features: [
      { icon: "/assets/icon_faith.png",         alt: "Faith Icon",         text: "One-on-One Men's Mentorship" },
      { icon: "/assets/icon_accountability.png", alt: "Accountability Icon", text: "Job Preparation & Accountability" },
    ],
  },
  {
    num: 1,
    subtitle: "Level 1: Transition Peak",
    title: "Stable Living & Independence",
    body: "The peak of the Faith Haven House experience is independence. Once basic needs are established and local support resources are connected, residents work with mentors to transition into permanent housing, build a sustainable personal budget, and cultivate long-term self-sufficiency.",
    features: [
      { icon: "/assets/icon_homeownership.png", alt: "Homeownership Icon", text: "Permanent Housing Connections" },
      { icon: "/assets/icon_empowerment.png",   alt: "Empowerment Icon",   text: "Financial Independence & Jobs" },
    ],
  },
];

export default function Pyramid() {
  const [active, setActive] = useState(3);
  const ref = useRef(null);
  useScrollReveal(ref, "[data-reveal]", { stagger: 0.13, y: 28, start: "top 87%" });

  return (
    <section className="pyramid-section" id="pyramid" ref={ref}>
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="section-eyebrow">Structured Transition</span>
          <h2 className="section-title">The Rebuilding Roadmap</h2>
          <p className="section-subtitle">
            Three interconnected layers of care support each resident as he moves from emergency shelter toward long-term stability and greater independence.
          </p>
        </div>

        <div className="pyramid-layout">
          <div className="pyramid-visual">
            {TIERS.map((tier) => (
              <div
                key={tier.num}
                className={`pyramid-tier${active === tier.num ? " active" : ""}`}
                onClick={() => setActive(tier.num)}
                data-reveal
              >
                <span className="pyramid-tier-num">0{tier.num}</span>
                <span className="pyramid-tier-name">{tier.name}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>
                  {tier.subtitle}
                </span>
              </div>
            ))}
          </div>

          <div className="pyramid-info-panel" data-reveal>
            {CARDS.map((card) => (
              <div
                key={card.num}
                className={`pyramid-card${active === card.num ? " active" : ""}`}
              >
                <span className="pyramid-card-subtitle">{card.subtitle}</span>
                <h3 className="pyramid-card-title">{card.title}</h3>
                <p className="pyramid-card-body">{card.body}</p>
                <div className="pyramid-features-list">
                  {card.features.map((f) => (
                    <div className="pyramid-feature-item" key={f.text}>
                      <img src={f.icon} alt={f.alt} />
                      <span>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
