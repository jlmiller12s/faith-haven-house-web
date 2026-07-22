"use client";

import { useState, useEffect, useRef } from "react";
import { useStaffSession } from "@/app/staff/StaffClientProvider";
import {
  getAllBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
} from "@/lib/blogService";

const QUICK_AVATAR_PRESETS = [
  { name: "Dareth Jeffers", image: "/assets/dareth.jpg" },
  { name: "Marshall Robinson", image: "/assets/marshall-robinson-enhanced.png" },
  { name: "Tammy Conderman", image: "/assets/tammy-conderman.jpg" },
  { name: "FHH Logo Mark", image: "/assets/fhh-favicon.png" }
];

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
    author_image: "/assets/dareth.jpg",
    status: "published"
  });
  const [saving, setSaving] = useState(false);

  // Drag & Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [showAdvancedUrl, setShowAdvancedUrl] = useState(false);
  const fileInputRef = useRef(null);

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
      author_image: "/assets/dareth.jpg",
      status: "published"
    });
    setShowAdvancedUrl(false);
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
      author_image: post.author_image || "/assets/dareth.jpg",
      status: post.status || "published"
    });
    setShowAdvancedUrl(false);
    setIsModalOpen(true);
  };

  // Image Upload File Processing (Drag & Drop or File Select)
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, WEBP, AVIF).");
      return;
    }
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        author_image: e.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
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
                            src={post.author_image || "/assets/dareth.jpg"}
                            alt=""
                            style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
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
              maxWidth: "760px",
              maxHeight: "92vh",
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

              {/* EASY DRAG AND DROP IMAGE UPLOADER SECTION */}
              <div
                style={{
                  backgroundColor: "var(--color-powder-blue-pale)",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  border: "1px solid rgba(92, 158, 173, 0.3)"
                }}
              >
                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "700", color: "var(--color-slate-dark)", marginBottom: "0.5rem" }}>
                  Author Headshot / Photo *
                </label>

                {/* Quick Presets Row */}
                <div style={{ marginBottom: "1rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--color-steel)", display: "block", marginBottom: "0.4rem" }}>
                    Quick Select Leadership Photo:
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {QUICK_AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, author_image: preset.image })}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          padding: "0.35rem 0.65rem",
                          borderRadius: "20px",
                          border: formData.author_image === preset.image ? "2px solid var(--color-teal)" : "1px solid var(--color-border)",
                          backgroundColor: formData.author_image === preset.image ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                          cursor: "pointer",
                          fontSize: "0.78rem",
                          fontWeight: "600",
                          color: "var(--color-charcoal)"
                        }}
                      >
                        <img
                          src={preset.image}
                          alt=""
                          style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }}
                        />
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: isDragging ? "2px dashed var(--color-teal)" : "2px dashed var(--color-steel)",
                    backgroundColor: isDragging ? "rgba(92, 158, 173, 0.15)" : "#FFFFFF",
                    borderRadius: "10px",
                    padding: "1.5rem",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />

                  {formData.author_image ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.25rem" }}>
                      <img
                        src={formData.author_image}
                        alt="Author Preview"
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          border: "2px solid var(--color-teal)"
                        }}
                      />
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: "700", color: "var(--color-slate-dark)", fontSize: "0.95rem" }}>
                          Selected Photo Preview
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--color-steel)", margin: "0.2rem 0" }}>
                          Drag &amp; drop another image here or click to replace
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: "0.25rem 0.65rem", fontSize: "0.75rem", marginTop: "0.2rem" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                        >
                          📷 Change / Upload New Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="1.8" style={{ marginBottom: "0.5rem" }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <div style={{ fontWeight: "700", color: "var(--color-slate-dark)", fontSize: "0.95rem" }}>
                        Drag &amp; Drop Image Here
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-steel)", marginTop: "0.2rem" }}>
                        or click to select photo from your computer
                      </div>
                    </div>
                  )}
                </div>

                {/* Advanced URL Toggle */}
                <div style={{ marginTop: "0.6rem", textAlign: "right" }}>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedUrl(!showAdvancedUrl)}
                    style={{ background: "none", border: "none", fontSize: "0.75rem", color: "var(--color-steel)", cursor: "pointer", textDecoration: "underline" }}
                  >
                    {showAdvancedUrl ? "Hide custom URL input" : "Advanced: Enter custom image URL"}
                  </button>
                </div>

                {showAdvancedUrl && (
                  <input
                    type="text"
                    value={formData.author_image}
                    onChange={(e) => setFormData({ ...formData, author_image: e.target.value })}
                    placeholder="/assets/lg.jpg"
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "6px",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.85rem",
                      marginTop: "0.4rem"
                    }}
                  />
                )}
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
                  src={previewPost.author_image || "/assets/dareth.jpg"}
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
