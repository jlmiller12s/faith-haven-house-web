import React from "react";

/**
 * Returns a clean, modern SVG path or cropped brand PNG icon.
 * Gets rid of raw emojis and uses the FHH Icon pack.
 */
export default function CrmIcon({ name, className = "", style = {} }) {
  const defaultStyle = {
    display: "inline-block",
    verticalAlign: "middle",
    width: "1.25rem",
    height: "1.25rem",
    stroke: "currentColor",
    fill: "none",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...style
  };

  // 1. Cropped FHH PNG Icon Pack Mapping
  const brandIcons = {
    faith: "/assets/icon_faith.png",
    hope: "/assets/icon_hope.png",
    restoration: "/assets/icon_restoration.png",
    accountability: "/assets/icon_accountability.png",
    empowerment: "/assets/icon_empowerment.png",
    homeownership: "/assets/icon_homeownership.png",
    coach: "/assets/icon-coach.png",
    meals: "/assets/icon-meals.png",
    mentor: "/assets/icon-mentor.png",
    monitor: "/assets/icon-monitor.png",
    monogram: "/assets/fhh-logo-standalone-icon.png",
    logo_full: "/assets/FHH-logo-clean.png"
  };

  if (brandIcons[name]) {
    const isFullLogo = name === "logo_full";
    const imgSize = isFullLogo ? { height: "2.25rem", width: "auto" } : { width: "1.75rem", height: "1.75rem" };
    return (
      <img 
        src={brandIcons[name]} 
        alt={`${name} icon`}
        className={className}
        style={{
          display: "inline-block",
          verticalAlign: "middle",
          objectFit: "contain",
          ...imgSize,
          ...style
        }}
      />
    );
  }

  // 2. Vector SVG Icons
  const svgPaths = {
    dashboard: (
      <rect x="3" y="3" width="7" height="9" rx="1" />
    ),
    cases: (
      <>
        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
        <path d="M2 10h20" />
      </>
    ),
    tasks: (
      <>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="m9 14 2 2 4-4" />
      </>
    ),
    notes: (
      <>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
      </>
    ),
    audit: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 11 2 2 4-4" />
      </>
    ),
    team: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
    lock: (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ),
    key: (
      <>
        <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5 3-3" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
    warning: (
      <>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </>
    ),
    check: (
      <polyline points="20 6 9 17 4 12" />
    ),
    flask: (
      <>
        <path d="M9 3h6" />
        <path d="M10 3v5c0 .5-.2 1-.6 1.4L4.3 15c-.9 1-.2 2.6 1.1 2.6h13.2c1.3 0 2-.1.5-2.6l-5.1-5.6c-.4-.4-.6-.9-.6-1.4V3" />
        <path d="M6 14h12" />
      </>
    )
  };

  const path = svgPaths[name] || (
    // Default fallback icon: info
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  );

  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      style={defaultStyle}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
