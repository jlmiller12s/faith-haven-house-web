"use client";

import { useEffect, useState, useRef } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";
import { getPublishedBlogPosts } from "@/lib/blogService";

export default function Blog() {
  const ref = useRef(null);
  useScrollReveal(ref, "[data-reveal]", { stagger: 0.12, y: 28, start: "top 88%" });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    let active = true;
    async function fetchPosts() {
      try {
        const list = await getPublishedBlogPosts();
        if (active) setPosts(list || []);
      } catch (err) {
        console.error("Error loading published blog posts", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchPosts();
    return () => {
      active = false;
    };
  }, []);

  const featuredPost = posts[0];
  const olderPosts = posts.slice(1);

  return (
    <section className="blog-section" id="blog" ref={ref} style={{ paddingBottom: "5rem" }}>
      <div className="container">
        <div className="section-header" data-reveal>
          <span className="section-eyebrow">
            {featuredPost?.eyebrow || "Updates from the Executive Director"}
          </span>
          <h2 className="section-title">The Blog &amp; Journal</h2>
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-steel)" }}>
            Loading blog posts...
          </div>
        ) : !featuredPost ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-steel)" }}>
            No journal entries published yet. Check back soon for updates!
          </div>
        ) : (
          <>
            {/* FEATURED LATEST POST */}
            <div
              className="blog-layout"
              data-reveal
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedPost(featuredPost)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedPost(featuredPost)}
            >
              <div className="blog-img-wrap">
                <img
                  src={featuredPost.author_image || "/assets/lg.jpg"}
                  alt={featuredPost.author_name}
                  className="blog-img"
                />
              </div>

              <div className="blog-details">
                <span className="blog-date">
                  {featuredPost.published_at
                    ? new Date(featuredPost.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })
                    : "December 14, 2022"}
                </span>
                <h3 className="blog-title">{featuredPost.title}</h3>
                <p className="blog-excerpt">
                  &ldquo;{featuredPost.excerpt || featuredPost.content}&rdquo;
                </p>
                <div className="blog-author" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>By {featuredPost.author_name}</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-teal)" }}>
                    Read Full Post &rarr;
                  </span>
                </div>
              </div>
            </div>

            {/* OLDER POSTS GRID */}
            {olderPosts.length > 0 && (
              <div style={{ marginTop: "3.5rem" }}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--color-slate-dark)", marginBottom: "1.5rem" }}>
                  Previous Journal Entries
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "1.75rem"
                  }}
                >
                  {olderPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "16px",
                        border: "1px solid var(--border-color)",
                        padding: "1.5rem",
                        boxShadow: "0 8px 24px rgba(41, 76, 96, 0.08)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease"
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-steel)", display: "block", marginBottom: "0.4rem" }}>
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })
                            : "Published Entry"}
                        </span>
                        <h4 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--color-slate-dark)", marginBottom: "0.5rem", lineHeight: "1.3" }}>
                          {post.title}
                        </h4>
                        <p style={{ fontSize: "0.88rem", color: "var(--color-steel)", lineHeight: "1.5", marginBottom: "1rem" }}>
                          {post.excerpt ? post.excerpt.substring(0, 120) + "..." : post.content.substring(0, 120) + "..."}
                        </p>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: "0.5rem", borderTop: "1px solid var(--color-border)" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--color-charcoal)", fontWeight: "600" }}>
                          {post.author_name}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "var(--color-teal)", fontWeight: "700" }}>
                          Read &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* READ FULL POST MODAL */}
      {selectedPost && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(33, 43, 54, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem"
          }}
          onClick={() => setSelectedPost(null)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "760px",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "2.5rem",
              boxShadow: "0 24px 60px rgba(0,0,0,0.3)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <span className="status-pill" style={{ marginBottom: "0.5rem" }}>
                  {selectedPost.eyebrow || "Executive Director Journal"}
                </span>
                <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-slate-dark)", margin: "0.3rem 0" }}>
                  {selectedPost.title}
                </h2>
                <div style={{ fontSize: "0.85rem", color: "var(--color-steel)", fontFamily: "var(--font-mono)" }}>
                  {selectedPost.published_at
                    ? new Date(selectedPost.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })
                    : "December 14, 2022"}
                </div>
              </div>

              <button
                onClick={() => setSelectedPost(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "var(--color-steel)",
                  padding: "0.25rem 0.5rem"
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem", padding: "1rem", backgroundColor: "var(--color-powder-blue-pale)", borderRadius: "12px" }}>
              <img
                src={selectedPost.author_image || "/assets/lg.jpg"}
                alt={selectedPost.author_name}
                style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover" }}
              />
              <div>
                <div style={{ fontWeight: "700", color: "var(--color-slate-dark)", fontSize: "0.95rem" }}>
                  {selectedPost.author_name}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>
                  Faith Haven House Leadership
                </div>
              </div>
            </div>

            <div style={{ fontSize: "1.05rem", lineHeight: "1.75", color: "var(--color-charcoal)", whiteSpace: "pre-line" }}>
              {selectedPost.content}
            </div>

            <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-border)", textAlign: "right" }}>
              <button className="btn btn-secondary" onClick={() => setSelectedPost(null)}>
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
