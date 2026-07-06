"use client";

import { useState } from "react";
import { RESOURCE_CATEGORIES } from "./resourceData";

export default function ResourcesLibraryPage() {
  const [selectedSlug, setSelectedSlug] = useState("financial-literacy");

  const currentCategory =
    RESOURCE_CATEGORIES.find((cat) => cat.slug === selectedSlug) ||
    RESOURCE_CATEGORIES[0];

  return (
    <div className="resources-page-wrapper">
      <div className="container">
        {/* Unified Site Section Header */}
        <div className="resources-section-header">
          <span className="section-eyebrow">Support &amp; Community Hub</span>
          <h1 className="section-title">Resource Library</h1>
          <p className="section-subtitle">
            A practical support center and referral hub for residents, families,
            churches, and community partners in St. Charles County.
          </p>
        </div>

        {/* Interactive Category Selector Grid */}
        <div
          className="resources-category-selector"
          role="tablist"
          aria-label="Resource Categories"
        >
          {RESOURCE_CATEGORIES.map((cat) => {
            const isSelected = selectedSlug === cat.slug;
            return (
              <button
                key={cat.slug}
                role="tab"
                id={`tab-${cat.slug}`}
                aria-selected={isSelected}
                aria-controls={`panel-${cat.slug}`}
                aria-pressed={isSelected}
                className={`resource-cat-btn${isSelected ? " active" : ""}`}
                onClick={() => setSelectedSlug(cat.slug)}
              >
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Category Content Card */}
        <main
          className="resources-active-card"
          role="tabpanel"
          id={`panel-${currentCategory.slug}`}
          aria-labelledby={`tab-${currentCategory.slug}`}
        >
          <div className="active-card-header">
            <div className="active-card-meta">
              <span className="meta-badge">Active Category</span>
              <span className="meta-count">
                {currentCategory.resources.length} Resource Entries
              </span>
            </div>
            <h2 className="active-cat-title">{currentCategory.title}</h2>
            <p className="active-cat-desc">{currentCategory.description}</p>
          </div>

          <div className="resource-cards-grid">
            {currentCategory.resources.map((item) => (
              <div key={item.id} className="resource-single-card">
                <div className="card-top-tags">
                  <span className="resource-type-tag">{item.type}</span>
                  {item.comingSoon && (
                    <span className="resource-status-badge">Coming Soon</span>
                  )}
                </div>
                <h3 className="resource-item-title">{item.title}</h3>
                <p className="resource-item-desc">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Empty state & ministry notice */}
          <div className="resources-info-notice">
            <div className="notice-icon" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="notice-text">
              <strong>Building Our Community Network:</strong> Faith Haven House
              is actively developing this support library to make helpful resources,
              referral networks, and local partner links easier to access. Check back
              regularly for updated guides.
            </div>
          </div>
        </main>

        {/* Page Footer Asset Tag */}
        <div className="resources-brand-footer">
          <div className="brand-footer-line" />
          <div className="brand-footer-content">
            <span className="brand-footer-left">
              HELPFUL CONTENT CAN BECOME A MINISTRY ASSET
            </span>
            <div className="brand-agency-credit">
              <span className="credit-label">PREPARED BY</span>
              <span className="credit-name">ALTARED ALCHEMIE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
