"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search, Plus, RefreshCw, Youtube, Instagram, Bookmark,
  Eye, EyeOff, Star, Trash2, ExternalLink, X, Check, Tag, Inbox
} from "lucide-react";
import type { Category, Reel } from "@/lib/supabase";

// ─── helpers ────────────────────────────────────────────────────────────────

function platformIcon(p: string) {
  if (p === "youtube") return <Youtube size={14} className="text-red-500" />;
  if (p === "instagram") return <Instagram size={14} className="text-pink-500" />;
  return null;
}

function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

const PALETTE = [
  "#6366f1","#3b82f6","#22c55e","#f59e0b",
  "#ef4444","#ec4899","#8b5cf6","#06b6d4",
];

// ─── ReelCard ───────────────────────────────────────────────────────────────

function ReelCard({
  reel,
  categories,
  onUpdate,
  onDelete,
}: {
  reel: Reel;
  categories: Category[];
  onUpdate: (id: string, patch: Partial<Reel>) => void;
  onDelete: (id: string) => void;
}) {
  const [showCatPicker, setShowCatPicker] = useState(false);
  const cat = categories.find((c) => c.id === reel.category_id);

  return (
    <div
      className={`relative rounded-xl overflow-hidden border flex flex-col group
        ${reel.is_watched ? "opacity-60" : ""}
        bg-[#1a1a24] border-[#2a2a38] hover:border-[#4a4a68] transition-all`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[#12121a] flex items-center justify-center overflow-hidden">
        {reel.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={reel.thumbnail}
            alt={reel.title ?? "Reel"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#444460]">
            {reel.platform === "instagram" ? (
              <Instagram size={32} />
            ) : (
              <Youtube size={32} />
            )}
            <span className="text-xs">No preview</span>
          </div>
        )}

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <a
            href={reel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-white/10 hover:bg-white/25 transition"
            title="Open link"
          >
            <ExternalLink size={16} />
          </a>
          <button
            onClick={() => onUpdate(reel.id, { is_watched: !reel.is_watched })}
            className="p-2 rounded-full bg-white/10 hover:bg-white/25 transition"
            title={reel.is_watched ? "Mark unwatched" : "Mark watched"}
          >
            {reel.is_watched ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            onClick={() => onDelete(reel.id)}
            className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 transition text-red-400"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Platform badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5 text-xs">
          {platformIcon(reel.platform)}
          <span className="capitalize">{reel.platform}</span>
        </div>

        {/* Favorite */}
        <button
          onClick={() => onUpdate(reel.id, { is_favorite: !reel.is_favorite })}
          className="absolute top-2 right-2"
        >
          <Star
            size={16}
            className={reel.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-white/40 hover:text-yellow-400"}
          />
        </button>
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-sm font-medium leading-snug line-clamp-2 text-[#e8e8f0]">
          {reel.title ?? reel.url}
        </p>
        {reel.author && (
          <p className="text-xs text-[#888899]">{reel.author}</p>
        )}

        {/* Category picker */}
        <div className="relative mt-auto pt-2">
          <button
            onClick={() => setShowCatPicker(!showCatPicker)}
            className="flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 border border-[#2a2a38] hover:border-[#4a4a68] transition"
            style={cat ? { borderColor: cat.color + "66", color: cat.color } : {}}
          >
            <Tag size={11} />
            {cat ? cat.name : "Add category"}
          </button>

          {showCatPicker && (
            <div className="absolute bottom-full mb-1 left-0 z-20 bg-[#1e1e2e] border border-[#3a3a50] rounded-xl shadow-xl p-2 min-w-[160px]">
              <button
                onClick={() => { onUpdate(reel.id, { category_id: null }); setShowCatPicker(false); }}
                className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-white/5 text-[#888899]"
              >
                No category
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { onUpdate(reel.id, { category_id: c.id }); setShowCatPicker(false); }}
                  className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-white/5 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  {c.name}
                  {reel.category_id === c.id && <Check size={11} className="ml-auto text-green-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-[10px] text-[#555568]">{timeAgo(reel.received_at)}</p>
      </div>
    </div>
  );
}

// ─── AddReelModal ────────────────────────────────────────────────────────────

function AddReelModal({
  categories,
  onClose,
  onAdded,
}: {
  categories: Category[];
  onClose: () => void;
  onAdded: (r: Reel) => void;
}) {
  const [url, setUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/reels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, category_id: categoryId || undefined, notes: notes || undefined }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed"); return; }
    onAdded(data);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1a1a24] border border-[#3a3a50] rounded-2xl p-6 w-full max-w-md flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Add Reel</h2>
          <button type="button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#888899]">YouTube or Instagram URL</label>
          <input
            type="url"
            required
            placeholder="https://youtube.com/shorts/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-[#12121a] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#888899]">Category (optional)</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="bg-[#12121a] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">— Uncategorized —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#888899]">Notes (optional)</label>
          <textarea
            rows={2}
            placeholder="Why did you save this?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-[#12121a] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg py-2 text-sm font-medium transition"
        >
          {loading ? "Fetching metadata…" : "Save Reel"}
        </button>
      </form>
    </div>
  );
}

// ─── ManageCategoriesModal ───────────────────────────────────────────────────

function ManageCategoriesModal({
  categories,
  onClose,
  onChange,
}: {
  categories: Category[];
  onClose: () => void;
  onChange: () => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0]);
  const [loading, setLoading] = useState(false);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    setLoading(false);
    setName("");
    onChange();
  }

  async function deleteCategory(id: string) {
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1a1a24] border border-[#3a3a50] rounded-2xl p-6 w-full max-w-md flex flex-col gap-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Manage Categories</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        {/* Existing categories */}
        <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.color }} />
              <span className="text-sm flex-1">{c.name}</span>
              <button
                onClick={() => deleteCategory(c.id)}
                className="text-[#555568] hover:text-red-400 transition"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Add new */}
        <form onSubmit={addCategory} className="flex flex-col gap-3 pt-3 border-t border-[#2a2a38]">
          <p className="text-xs text-[#888899] font-medium uppercase tracking-wider">New category</p>
          <input
            required
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#12121a] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
          <div className="flex gap-2 flex-wrap">
            {PALETTE.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setColor(p)}
                className="w-6 h-6 rounded-full border-2 transition"
                style={{ background: p, borderColor: color === p ? "white" : "transparent" }}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg py-2 text-sm font-medium transition"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [platform, setPlatform] = useState("");
  const [showFavs, setShowFavs] = useState(false);
  const [showUnwatched, setShowUnwatched] = useState(false);
  const [q, setQ] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showManageCats, setShowManageCats] = useState(false);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data ?? []);
  }, []);

  const fetchReels = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (platform) params.set("platform", platform);
    if (showFavs) params.set("favorite", "true");
    if (showUnwatched) params.set("watched", "false");
    if (q) params.set("q", q);
    const res = await fetch(`/api/reels?${params}`);
    const data = await res.json();
    setReels(data ?? []);
    setLoading(false);
  }, [activeCategory, platform, showFavs, showUnwatched, q]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchReels(); }, [fetchReels]);

  async function handleUpdate(id: string, patch: Partial<Reel>) {
    const res = await fetch(`/api/reels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated = await res.json();
      setReels((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this reel?")) return;
    await fetch(`/api/reels/${id}`, { method: "DELETE" });
    setReels((prev) => prev.filter((r) => r.id !== id));
  }

  const uncategorizedCount = reels.filter((r) => !r.category_id).length;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-[#2a2a38] flex flex-col bg-[#13131c]">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-[#2a2a38]">
          <div className="flex items-center gap-2">
            <Bookmark size={18} className="text-indigo-400" />
            <span className="font-bold text-base tracking-tight">ReelVault</span>
          </div>
          <p className="text-[11px] text-[#555568] mt-0.5">Your saved reels</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5">
          {[
            { id: "all", label: "All Reels" },
            { id: "uncategorized", label: "Uncategorized", count: uncategorizedCount },
          ].map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition
                ${activeCategory === id ? "bg-indigo-600/20 text-indigo-300" : "text-[#aaaacc] hover:bg-white/5"}`}
            >
              <span className="flex items-center gap-2">
                {id === "uncategorized" && <Inbox size={13} />}
                {label}
              </span>
              {count !== undefined && count > 0 && (
                <span className="bg-indigo-500/30 text-indigo-300 text-[10px] rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {count}
                </span>
              )}
            </button>
          ))}

          <div className="mt-3 mb-1 px-3 text-[10px] uppercase tracking-widest text-[#555568] font-medium">
            Categories
          </div>

          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition
                ${activeCategory === c.id ? "bg-white/10 text-white" : "text-[#aaaacc] hover:bg-white/5"}`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
              {c.name}
            </button>
          ))}

          <button
            onClick={() => setShowManageCats(true)}
            className="mt-2 w-full text-left px-3 py-2 rounded-lg text-xs text-[#555568] hover:text-[#888899] hover:bg-white/5 flex items-center gap-2 transition"
          >
            <Plus size={12} /> Manage categories
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="border-b border-[#2a2a38] px-6 py-3 flex items-center gap-3 flex-shrink-0 bg-[#0f0f13]">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555568]" />
            <input
              placeholder="Search titles…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-[#1a1a24] border border-[#2a2a38] rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-[#555568]"
            />
          </div>

          {/* Platform filter */}
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="bg-[#1a1a24] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-[#aaaacc]"
          >
            <option value="">All platforms</option>
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
          </select>

          {/* Toggles */}
          <button
            onClick={() => setShowFavs(!showFavs)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition
              ${showFavs ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10" : "border-[#2a2a38] text-[#888899] hover:border-[#4a4a68]"}`}
          >
            <Star size={13} /> Favs
          </button>
          <button
            onClick={() => setShowUnwatched(!showUnwatched)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition
              ${showUnwatched ? "border-indigo-500/50 text-indigo-300 bg-indigo-500/10" : "border-[#2a2a38] text-[#888899] hover:border-[#4a4a68]"}`}
          >
            <Eye size={13} /> Unwatched
          </button>

          <button onClick={fetchReels} className="p-2 rounded-lg border border-[#2a2a38] hover:border-[#4a4a68] transition text-[#888899]">
            <RefreshCw size={14} />
          </button>

          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus size={14} /> Add Reel
          </button>
        </header>

        {/* Grid */}
        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-[#555568]">
              <RefreshCw size={20} className="animate-spin mr-2" /> Loading…
            </div>
          ) : reels.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#555568] gap-3">
              <Bookmark size={32} />
              <p className="text-sm">No reels here yet.</p>
              <p className="text-xs">Share a YouTube or Instagram link to yourself on WhatsApp, or click &ldquo;Add Reel&rdquo;.</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
              {reels.map((reel) => (
                <ReelCard
                  key={reel.id}
                  reel={reel}
                  categories={categories}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showAdd && (
        <AddReelModal
          categories={categories}
          onClose={() => setShowAdd(false)}
          onAdded={(r) => { setReels((prev) => [r, ...prev]); }}
        />
      )}
      {showManageCats && (
        <ManageCategoriesModal
          categories={categories}
          onClose={() => setShowManageCats(false)}
          onChange={() => { fetchCategories(); fetchReels(); }}
        />
      )}
    </div>
  );
}
