"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import useScrollReveal from "@/hooks/useScrollReveal";

const POSITIONS = ["Daytime Monitor", "Meal Delivery", "Life Skills", "Mentor"];
const POSITION_LABELS = {
  "Daytime Monitor": "Daytime House Monitor",
  "Meal Delivery":   "Meal Train Delivery",
  "Life Skills":     "Life Skills Coach",
  Mentor:            "Resident Mentor",
};

function AccordionItem({ title, isOpen, onToggle, children }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current) return;
    gsap.to(contentRef.current, {
      height:   isOpen ? "auto" : 0,
      opacity:  isOpen ? 1 : 0,
      duration: 0.4,
      ease:     "power2.out",
    });
  }, [isOpen]);

  return (
    <div className={`accordion-item${isOpen ? " active" : ""}`}>
      <button className="accordion-trigger" onClick={onToggle}>
        <h3>{title}</h3>
        <span className="accordion-icon">+</span>
      </button>
      <div className="accordion-content" ref={contentRef} style={{ height: 0, opacity: 0 }}>
        <div className="accordion-content-inner">{children}</div>
      </div>
    </div>
  );
}

export default function Volunteer() {
  const [openIndex, setOpenIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const ref = useRef(null);

  useScrollReveal(ref, "[data-reveal]", { stagger: 0.13, y: 28, start: "top 87%" });

  const toggle = (i) => setOpenIndex(openIndex === i ? -1 : i);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      firstname:    formData.get("firstname"),
      lastname:     formData.get("lastname"),
      email:        formData.get("email"),
      phone:        formData.get("phone"),
      positions:    formData.getAll("positions"),
      skills:       formData.get("skills"),
      availability: formData.get("availability"),
    };
    try {
      await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch { /* silent */ }
    form.reset();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4500);
  }

  return (
    <section className="volunteer-section" id="volunteer" ref={ref}>
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="section-eyebrow">Join the Servant Leaders</span>
          <h2 className="section-title">Volunteer SOP &amp; Opportunities</h2>
        </div>

        <div className="volunteer-layout">
          <div className="accordions-container" data-reveal>
            <AccordionItem
              title="Daytime House Monitor (Core SOP)"
              isOpen={openIndex === 0}
              onToggle={() => toggle(0)}
            >
              <p>
                <strong>Overview:</strong> Volunteer Monitors are the primary staff presence at
                Faith Haven House. They monitor guests and property, maintaining safety and a
                welcoming, professional, integrity-focused environment.
              </p>
              <div className="sop-grid">
                <div className="sop-col">
                  <h4>Essential Duties</h4>
                  <ul>
                    <li>Maintain property safety and security</li>
                    <li>Supervise all guests during day hours</li>
                    <li>Ensure rule and boundary compliance</li>
                    <li>Be approachable and spend time with residents</li>
                  </ul>
                </div>
                <div className="sop-col">
                  <h4>Qualifications &amp; SOP</h4>
                  <ul>
                    <li>Strong boundaries and interpersonal skills</li>
                    <li>Ability to lead and instruct</li>
                    <li>Empathy and willingness to listen</li>
                    <li>Subject to background check</li>
                  </ul>
                </div>
              </div>
            </AccordionItem>

            <AccordionItem
              title="Meal Train Delivery"
              isOpen={openIndex === 1}
              onToggle={() => toggle(1)}
            >
              <p>
                Deliver hot, healthy meals directly to Faith Haven House to support residents
                during their evening transition. Nourishment is key to building a healthy body and spirit.
              </p>
              <a
                href="https://www.mealtrain.com/trains/yq254l"
                target="_blank"
                rel="noopener"
                className="btn btn-secondary"
                style={{ marginTop: "1rem", display: "inline-flex" }}
              >
                Join The Meal Train →
              </a>
            </AccordionItem>

            <AccordionItem
              title="Life Skills Coach"
              isOpen={openIndex === 2}
              onToggle={() => toggle(2)}
            >
              <p>
                Teach specialized skills such as budget management, resume building, basic
                computer literacy, nutrition, or job interviewing. Coaches share their
                professional experience to guide residents in self-sufficiency.
              </p>
            </AccordionItem>

            <AccordionItem
              title="Resident Mentor (Men Only)"
              isOpen={openIndex === 3}
              onToggle={() => toggle(3)}
            >
              <p>
                Build a trust-filled relationship with a resident. Walk alongside them weekly,
                providing personal accountability, encouragement, spiritual counseling, and a
                reliable friend to talk to.
              </p>
            </AccordionItem>
          </div>

          <div className="volunteer-form-container" data-reveal>
            <h3>Apply to Volunteer</h3>
            <p>Help us make a difference in St. Charles County.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="firstname">FIRST_NAME</label>
                  <input type="text" id="firstname" name="firstname" required />
                </div>
                <div className="form-group">
                  <label htmlFor="lastname">LAST_NAME</label>
                  <input type="text" id="lastname" name="lastname" required />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="email">EMAIL_ADDRESS</label>
                  <input type="email" id="email" name="email" required />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">PHONE_NUMBER</label>
                  <input type="tel" id="phone" name="phone" required />
                </div>
              </div>
              <div className="form-group">
                <span className="checkbox-group-label">POSITIONS_OF_INTEREST</span>
                <div className="checkboxes-grid">
                  {POSITIONS.map((p) => (
                    <label className="checkbox-label" key={p}>
                      <input type="checkbox" name="positions" value={p} />
                      <span className="checkbox-text">{POSITION_LABELS[p]}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="skills">SPECIAL_SKILLS_OR_BACKGROUND</label>
                <textarea id="skills" name="skills" rows={3}
                  placeholder="List any non-profit, medical, security, counseling, or teaching background..." />
              </div>
              <div className="form-group">
                <label htmlFor="availability">AVAILABILITY</label>
                <textarea id="availability" name="availability" rows={2}
                  placeholder="e.g., Tuesday mornings, weekend shifts..." />
              </div>
              {submitted ? (
                <div className="form-success-msg">✓ Application Submitted! Thank you for saying YES.</div>
              ) : (
                <button type="submit" className="form-submit-btn">
                  Submit Volunteer Application →
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
