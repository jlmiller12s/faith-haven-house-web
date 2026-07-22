import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export const INITIAL_BLOG_POSTS = [
  {
    id: "e2b4f98d-8a71-4b46-9d32-671234567890",
    title: "Hello and Thank You",
    slug: "hello-and-thank-you",
    eyebrow: "Updates from the Executive Director",
    excerpt:
      "So much to be thankful for here at Faith Haven House! The first month of having residents is now under our belt. It has been a very successful month in my book. Job obtained, interviews had, and donations have been pouring in, and our first resident is moving out! We are so blessed! I am so humbled that God chose me. We are still ironing out routines and getting used to the process...",
    content:
      "So much to be thankful for here at Faith Haven House! The first month of having residents is now under our belt. It has been a very successful month in my book. Job obtained, interviews had, and donations have been pouring in, and our first resident is moving out! We are so blessed! I am so humbled that God chose me. We are still ironing out routines and getting used to the process.\n\nThank you to everyone in St. Charles County who has prayed, donated meals, and supported our mission to provide dignity and a path forward for unhoused men in our community.",
    author_name: "Dareth Jeffers, Founder & Executive Director",
    author_image: "/assets/lg.jpg",
    cover_image: null,
    published_at: "2022-12-14T00:00:00Z",
    status: "published",
    created_at: "2022-12-14T00:00:00Z"
  }
];

const LOCAL_STORAGE_KEY = "fhh_blog_posts_override_v1";

function getLocalStoragePosts() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function setLocalStoragePosts(posts) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error("Could not write blog posts to localStorage", e);
  }
}

/**
 * Fetch published blog posts for public /blog page.
 */
export async function getPublishedBlogPosts() {
  const supabase = createSupabaseBrowserClient();
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (e) {
    console.warn("Supabase fetch failed, checking local store / fallback", e);
  }

  // Local Storage check for client-side state
  const local = getLocalStoragePosts();
  if (local && local.length > 0) {
    return local.filter((p) => p.status === "published");
  }

  return INITIAL_BLOG_POSTS;
}

/**
 * Fetch all blog posts (published & draft) for RAP Portal staff dashboard.
 */
export async function getAllBlogPosts() {
  const supabase = createSupabaseBrowserClient();
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (e) {
    console.warn("Supabase fetch all failed, checking local store / fallback", e);
  }

  const local = getLocalStoragePosts();
  if (local && local.length > 0) {
    return local;
  }

  return INITIAL_BLOG_POSTS;
}

/**
 * Create a new blog post.
 */
export async function createBlogPost(postData) {
  const supabase = createSupabaseBrowserClient();
  const slug = postData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || `post-${Date.now()}`;

  const payload = {
    title: postData.title,
    slug,
    eyebrow: postData.eyebrow || "Updates from the Executive Director",
    excerpt: postData.excerpt || postData.content.substring(0, 160) + "...",
    content: postData.content,
    author_name: postData.author_name || "Faith Haven House Leadership",
    author_image: postData.author_image || "/assets/lg.jpg",
    cover_image: postData.cover_image || null,
    published_at: postData.published_at || new Date().toISOString(),
    status: postData.status || "published"
  };

  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .insert([payload])
      .select()
      .single();

    if (!error && data) {
      return data;
    }
  } catch (e) {
    console.warn("Supabase insert error, saving to local store", e);
  }

  // Fallback local storage save
  const current = (await getAllBlogPosts()) || [];
  const newPost = {
    id: `local-${Date.now()}`,
    ...payload,
    created_at: new Date().toISOString()
  };
  const updated = [newPost, ...current];
  setLocalStoragePosts(updated);
  return newPost;
}

/**
 * Update an existing blog post.
 */
export async function updateBlogPost(id, postData) {
  const supabase = createSupabaseBrowserClient();
  const payload = {
    ...postData,
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      return data;
    }
  } catch (e) {
    console.warn("Supabase update error, modifying local store", e);
  }

  const current = (await getAllBlogPosts()) || [];
  const updated = current.map((p) => (p.id === id ? { ...p, ...payload } : p));
  setLocalStoragePosts(updated);
  return updated.find((p) => p.id === id);
}

/**
 * Delete a blog post.
 */
export async function deleteBlogPost(id) {
  const supabase = createSupabaseBrowserClient();
  try {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (!error) {
      return true;
    }
  } catch (e) {
    console.warn("Supabase delete error, removing from local store", e);
  }

  const current = (await getAllBlogPosts()) || [];
  const updated = current.filter((p) => p.id !== id);
  setLocalStoragePosts(updated);
  return true;
}
