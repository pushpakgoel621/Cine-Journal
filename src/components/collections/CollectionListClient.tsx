"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import Link from "next/link";

interface CollectionData {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  _count: { items: number };
}

export default function CollectionListClient({ initialCollections }: { initialCollections: CollectionData[] }) {
  const [collections, setCollections] = useState(initialCollections);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const { addToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, isPublic }),
      });

      if (!res.ok) throw new Error("Failed to create collection");

      const newCol = await res.json();
      setCollections([{ ...newCol, _count: { items: 0 } }, ...collections]);
      setIsCreating(false);
      setTitle("");
      setDescription("");
      setIsPublic(true);
      addToast("Collection created successfully", "success");
    } catch {
      addToast("Failed to create collection", "error");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this list?")) return;

    try {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete list");

      setCollections(collections.filter(c => c.id !== id));
      addToast("List deleted", "success");
    } catch {
      addToast("Failed to delete list", "error");
    }
  }

  return (
    <div className="collection-list-client">
      <div className="collection-actions">
        <button 
          className="btn btn-primary" 
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? "Cancel" : "➕ Create New List"}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="create-collection-form fade-in">
          <div className="form-group">
            <label>Title</label>
            <input 
              className="form-input" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. My Favorite Sci-Fi" 
              maxLength={100}
              required 
            />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea 
              className="form-textarea" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              maxLength={500}
            />
          </div>
          <div className="form-group check-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="checkbox" 
                checked={isPublic} 
                onChange={e => setIsPublic(e.target.checked)} 
              />
              Make Public (visible on your profile)
            </label>
          </div>
          <button type="submit" className="btn btn-primary">Save List</button>
        </form>
      )}

      {collections.length > 0 ? (
        <div className="collections-grid">
          {collections.map(c => (
            <div className="collection-card" key={c.id}>
              <div className="collection-card-header">
                <h3>{c.title}</h3>
                <button 
                  className="icon-btn delete-btn" 
                  onClick={(e) => handleDelete(c.id, e)}
                  title="Delete List"
                >
                  🗑️
                </button>
              </div>
              {c.description && <p className="collection-desc">{c.description}</p>}
              <div className="collection-meta">
                <span className="collection-badge">{c._count.items} movies</span>
                <span className={`collection-badge ${c.isPublic ? 'public' : 'private'}`}>
                  {c.isPublic ? "🌍 Public" : "🔒 Private"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>You haven't created any lists yet.</p>
        </div>
      )}
    </div>
  );
}
