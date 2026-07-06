"use client";

import { useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function AboutContent() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Float-up parallax animation driven by Lenis scroll
      gsap.utils.toArray("[data-float-up]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 35, opacity: 0.9 },
          {
            y: -25,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      });

      // Smooth reveal entrance animation
      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 45, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true,
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="about-page-wrapper">
      <div className="container">
        {/* HERO SECTION */}
        <section className="about-hero-section" data-float-up data-reveal>
          <span className="section-eyebrow">OUR STORY &amp; MISSION</span>
          <h1 className="about-hero-title">Rebuilding Lives, Restoring Hope</h1>
          <p className="about-hero-lead">
            Faith Haven House will be a place where the residents can start the
            re-building process. We will be working with homeless men with the
            goal to help them transition to a stable living environment. Throughout
            the transition, they will receive a network of support with available
            resources.
          </p>
        </section>

        {/* MEMORIAL CARD CALLOUT */}
        <section className="about-memorial-card-section" data-reveal>
          <div className="about-memorial-card">
            <div className="about-memorial-card-body">
              <span className="about-memorial-eyebrow">IN LOVING MEMORY</span>
              <h2 className="about-memorial-title">In Loving Memory of Our Founder</h2>
              <p className="about-memorial-text">
                Faith Haven House was founded by Dareth Renee Jeffers, whose faith,
                compassion, and commitment to serving men in need continue to shape
                this ministry today.
              </p>
              <Link href="/about/dareth-jeffers" className="btn btn-primary about-memorial-btn">
                Learn About Dareth’s Legacy →
              </Link>
            </div>
          </div>
        </section>

        {/* FOUNDER'S STORY SECTION */}
        <section className="about-story-section" data-float-up>
          <div className="story-grid">
            {/* Founder Image Card */}
            <div className="story-founder-card" data-reveal>
              <div className="founder-image-wrapper">
                <img
                  src="/assets/dareth_founder_1.avif"
                  alt="Dareth Jeffers, Founder and Executive Director"
                  className="founder-img"
                />
              </div>
              <div className="founder-card-caption">
                <h3>Dareth Jeffers</h3>
                <span className="founder-title">
                  Founder &amp; Executive Director
                </span>
                <p className="founder-location">
                  St. Charles County, Missouri
                </p>
              </div>
            </div>

            {/* Narrative Content */}
            <div className="story-narrative-content" data-reveal>
              <span className="section-eyebrow">FOUNDER'S TESTIMONY</span>
              <h2 className="story-heading">How We Got Started</h2>

              <div className="narrative-paragraphs">
                <p>
                  Beginning in 2013 through 2015, I helped serve meals at the
                  Salvation Army in St. Charles. Numerous times, men and women
                  would come for lunch and ask if we knew of any places where they
                  could stay. It was always difficult to continue to answer no.
                </p>
                <p>
                  I began to pray for direction on how I could do more. I had
                  always wanted to perpetually volunteer and help others. We don’t
                  always get the chance to decide what that looks like. But if we
                  are still and follow God’s lead, He will give us the direction. We
                  just have to decide to say <strong>YES!</strong>
                </p>
                <p>
                  Over the following months, I met with others who had already
                  started non-profits for direction. God not only orchestrated
                  those meetings, but He provided partners who have been helping the
                  homeless for some time already, a name, a logo, and a plan to
                  visit an existing shelter. During the rest of the year and since,
                  there have been numerous lessons in patience and trusting in
                  God’s timing. He continues to send the servant-hearted people
                  who are ready and able to help. I will continue to say yes so
                  that homeless men of St. Charles will have a place to stay and a
                  chance to re-build.
                </p>

                <blockquote className="founder-quote-block" data-float-up>
                  <p>
                    "I will continue to say yes so that homeless men of St. Charles
                    will have a place to stay and a chance to re-build."
                  </p>
                  <cite>— Founder and Executive Director, Dareth Jeffers</cite>
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* CONTINUOUS SCROLLING CAROUSEL SECTION */}
        <section className="about-gallery-section" data-float-up>
          <div className="gallery-header" data-reveal>
            <span className="section-eyebrow">COMMUNITY &amp; MINISTRY IN ACTION</span>
            <h2 className="section-title">Serving St. Charles Together</h2>
          </div>

          <div className="about-carousel-container" aria-label="Infinite scrolling photo carousel">
            <div className="about-carousel-track">
              {/* Render 3 identical sets for a seamless infinite loop */}
              {[1, 2, 3].flatMap((setNum) => [
                {
                  id: `img-1-${setNum}`,
                  src: "/assets/dareth_founder_2.avif",
                  alt: "Dareth Jeffers in the community",
                  caption: "Leadership & Vision",
                },
                {
                  id: `img-2-${setNum}`,
                  src: "/assets/fhh_community_1.avif",
                  alt: "Faith Haven House community gathering",
                  caption: "Community Support",
                },
                {
                  id: `img-3-${setNum}`,
                  src: "/assets/fhh_community_2.avif",
                  alt: "Volunteers serving together",
                  caption: "Servant Leadership",
                },
                {
                  id: `img-4-${setNum}`,
                  src: "/assets/fhh_community_3.avif",
                  alt: "Faith Haven House community event",
                  caption: "Building Relationships",
                },
                {
                  id: `img-5-${setNum}`,
                  src: "/assets/dareth_founder_1.avif",
                  alt: "Faith Haven House Founder",
                  caption: "Faith &amp; Service",
                },
              ]).map((item) => (
                <div key={item.id} className="carousel-card">
                  <div className="carousel-img-wrapper">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="carousel-img"
                    />
                  </div>
                  <div className="carousel-caption" dangerouslySetInnerHTML={{ __html: item.caption }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
