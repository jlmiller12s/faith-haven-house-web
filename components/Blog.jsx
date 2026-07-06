"use client";

import { useRef } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";

export default function Blog() {
  const ref = useRef(null);
  useScrollReveal(ref, "[data-reveal]", { stagger: 0.12, y: 28, start: "top 88%" });

  return (
    <section className="blog-section" id="blog" ref={ref}>
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="section-eyebrow">Updates from the Executive Director</span>
          <h2 className="section-title">The Blog &amp; Journal</h2>
        </div>

        <div className="blog-layout" data-reveal>
          <div className="blog-img-wrap">
            <img
              src="/assets/lg.jpg"
              alt="Dareth Jeffers - Faith Haven House Blog"
              className="blog-img"
            />
          </div>

          <div className="blog-details">
            <span className="blog-date">December 14, 2022</span>
            <h3 className="blog-title">Hello and Thank You</h3>
            <p className="blog-excerpt">
              &ldquo;So much to be thankful for here at Faith Haven House! The first month of having
              residents is now under our belt. It has been a very successful month in my book. Job
              obtained, interviews had, and donations have been pouring in, and our first resident
              is moving out! We are so blessed! I am so humbled that God chose me. We are still
              ironing out routines and getting used to the process...&rdquo;
            </p>
            <div className="blog-author">
              <span>By Dareth Jeffers, Founder &amp; Executive Director</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
