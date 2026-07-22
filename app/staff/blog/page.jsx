"use client";

import { useState, useEffect } from "react";
import { useStaffSession } from "@/app/staff/StaffClientProvider";
import {
  getAllBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
} from "@/lib/blogService";

export default function StaffBlogManager() {
  const { activeStaff } = useStaffSession();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    eyebrow: "Updates from the Executive Director",
    excerpt: "",
    content: "",
    author_name: "Dareth Jeffers, Founder & Executive Director",
    author_image: "/assets/lg.jpg",
    status: "published"
  });
  const [saving, setSaving] = useState(false);

  // Preview Post Modal
  const [previewPost, setPreviewPost] = useState(null);

  // Load blog posts on mount
  const loadPosts = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const list = await getAllBlogPosts();
      setPosts(list || []);
    } catch (err) {
      setErrorMsg("Failed to load blog posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      eyebrow: "Updates from the Executive Director",
      excerpt: "",
      content: "",
      author_name: `${activeStaff?.first_name || "Dareth"} ${activeStaff?.last_name || "Jeffers"}, Executive Director`,
      author_image: "/assets/lg.jpg",
      status: "published"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || "",
      eyebrow: post.eyebrow || "Updates from the Executive Director",
      excerpt: post.excerpt || "",
      content: post.content || "",
      author_name: post.author_name || "",
      author_image: post.author_image || "/assets/lg.jpg",
      status: post.status || "published"
    });
    setIsModalOpen(true);
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setErrorMsg("Title and Main Content are required.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (editingPost) {
        await updateBlogPost(editingPost.id, formData);
        setSuccessMsg("Blog post updated successfully!");
      } else {
        await createBlogPost(formData);
        setSuccessMsg("New blog post created successfully!");
      }
      setIsModalOpen(false);
      await loadPosts();
    } catch (err) {
      setErrorMsg(err?.message || "Error saving blog post.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (post) => {
    if (!window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      return;
    }
    setErrorMsg(null);
    try {
      await deleteBlogPost(post.id);
      setSuccessMsg("Blog post deleted.");
      await loadPosts();
    } catch (err) {
      setErrorMsg("Could not delete blog post.");
    }
  };

  // Metrics
  const totalPosts = posts.length;
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  return (
    <main className="crm-container" style={{ paddingBottom: "4rem" }}>
      {/* Header Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div>
          <span className="status-pill" style={{ marginBottom: "0.5rem", display: "inline-flex" }}>
            RAP Portal • Content Management
          </span>
          <h1 className="crm-title" style={{ margin: "0.2rem 0" }}>
            Blog &amp; Journal Manager
          </h1>
          <p className="crm-subtitle" style={{ margin: 0 }}>
            Create, edit, and publish Executive Director journal updates for the public website.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openCreateModal}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.4rem"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create New Post
        </button>
      </div>

      {/* Toast Notifications */}
      {successMsg && (
        <div
          style={{
            backgroundColor: "rgba(46, 125, 50, 0.12)",
            color: "#1b5e20",
            border: "1px solid rgba(46, 125, 50, 0.3)",
            padding: "0.85rem 1.25rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <span>{successMsg}</span>
          <button
            onClick={() => setSuccessMsg(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "700" }}
          >
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            backgroundColor: "rgba(198, 40, 40, 0.12)",
            color: "#c62828",
            border: "1px solid rgba(198, 40, 40, 0.3)",
            padding: "0.85rem 1.25rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "700" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2.5rem"
        }}
      >
        <div className="crm-card" style={{ padding: "1.25rem 1.5rem" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-steel)" }}>
            Total Journal Entries
          </span>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--color-slate-dark)", marginTop: "0.2rem" }}>
            {totalPosts}
          </div>
        </div>

        <div className="crm-card" style={{ padding: "1.25rem 1.5rem" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-steel)" }}>
            Published Live
          </span>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#2e7d32", marginTop: "0.2rem" }}>
            {publishedCount}
          </div>
        </div>

        <div className="crm-card" style={{ padding: "1.25rem 1.5rem" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-steel)" }}>
            Draft Entries
          </span>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--color-terracotta)", marginTop: "0.2rem" }}>
            {draftCount}
          </div>
        </div>
      </div>

      {/* Main Blog Table */}
      <div className="crm-card" style={{ padding: "1.75rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--color-slate-dark)", marginBottom: "1.25rem" }}>
          Published &amp; Draft Journal Posts
        </h2>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-steel)" }}>
            Loading blog posts...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-steel)", border: "1px dashed var(--color-border)", borderRadius: "8px" }}>
            No blog posts found. Click <strong>Create New Post</strong> to add your first entry.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-border)", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--color-steel)", letterSpacing: "0.04em" }}>
                  <th style={{ padding: "0.75rem 1rem" }}>Post Title</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Author</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Published Date</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const dateStr = post.published_at
                    ? new Date(post.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })
                    : "Unscheduled";

                  return (
                    <tr key={post.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: "700", color: "var(--color-charcoal)", fontSize: "1.05rem" }}>
                          {post.title}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>
                          {post.eyebrow}
                        </div>
                      </td>

                      <td style={{ padding: "1rem", fontSize: "0.9rem", color: "var(--color-charcoal)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <img
                            src={post.author_image || "/assets/lg.jpg"}
                            alt=""
                            style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
                          />
                          <span>{post.author_name}</span>
                        </div>
                      </td>

                      <td style={{ padding: "1rem", fontSize: "0.88rem", color: "var(--color-steel)" }}>
                        {dateStr}
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <span
                          className={`crm-badge ${post.status === "published" ? "slate" : "terracotta"}`}
                          style={{
                            backgroundColor: post.status === "published" ? "rgba(46, 125, 50, 0.12)" : "rgba(200, 107, 74, 0.15)",
                            color: post.status === "published" ? "#1b5e20" : "var(--color-terracotta)"
                          }}
                        >
                          {post.status.toUpperCase()}
                        </span>
                      </td>

                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => setPreviewPost(post)}
                            style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                          >
                            Preview
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => openEditModal(post)}
                            style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleDeletePost(post)}
                            style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", color: "#c62828", borderColor: "rgba(198,40,40,0.3)" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(33, 43, 54, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "720px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              padding: "2rem"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--color-slate-dark)", margin: 0 }}>
                {editingPost ? "Edit Blog Entry" : "Create New Blog Entry"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--color-steel)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePost} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--color-charcoal)", marginBottom: "0.35rem" }}>
                  Post Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Hello and Thank You"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.95rem"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--color-charcoal)", marginBottom: "0.35rem" }}>
                  Header Eyebrow Category
                </label>
                <input
                  type="text"
                  value={formData.eyebrow}
                  onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                  placeholder="e.g. Updates from the Executive Director"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.95rem"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--color-charcoal)", marginBottom: "0.35rem" }}>
                    Author Name &amp; Title
                  </label>
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    placeholder="e.g. Dareth Jeffers, Founder & Executive Director"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "6px",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.95rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--color-charcoal)", marginBottom: "0.35rem" }}>
                    Author Image Asset URL
                  </label>
                  <input
                    type="text"
                    value={formData.author_image}
                    onChange={(e) => setFormData({ ...formData, author_image: e.target.value })}
                    placeholder="/assets/lg.jpg"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "6px",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.95rem"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--color-charcoal)", marginBottom: "0.35rem" }}>
                  Excerpt / Summary Quote
                </label>
                <textarea
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Short summary displayed on the card..."
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.95rem"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--color-charcoal)", marginBottom: "0.35rem" }}>
                  Full Article Body Content *
                </label>
                <textarea
                  rows={8}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write full article body text here..."
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.95rem",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--color-charcoal)", marginBottom: "0.35rem" }}>
                  Publishing Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.95rem"
                  }}
                >
                  <option value="published">Published (Visible on Public Website)</option>
                  <option value="draft">Draft (Private in Portal Only)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? "Saving..." : editingPost ? "Save Changes" : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewPost && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(33, 43, 54, 0.75)",
            backdropFilter: "blur(5px)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "840px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "2.5rem",
              boxShadow: "0 24px 60px rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <span className="status-pill">
                Live Public Website Preview
              </span>
              <button
                onClick={() => setPreviewPost(null)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--color-steel)" }}
              >
                ✕
              </button>
            </div>

            <div className="blog-layout" style={{ margin: 0 }}>
              <div className="blog-img-wrap">
                <img
                  src={previewPost.author_image || "/assets/lg.jpg"}
                  alt={previewPost.author_name}
                  className="blog-img"
                />
              </div>

              <div className="blog-details">
                <span className="blog-date">
                  {previewPost.published_at
                    ? new Date(previewPost.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })
                    : "December 14, 2022"}
                </span>
                <h3 className="blog-title">{previewPost.title}</h3>
                <p className="blog-excerpt" style={{ whiteSpace: "pre-line" }}>
                  &ldquo;{previewPost.excerpt || previewPost.content}&rdquo;
                </p>
                <div className="blog-author">
                  <span>By {previewPost.author_name}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-border)", textAlign: "right" }}>
              <button className="btn btn-secondary" onClick={() => setPreviewPost(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
