"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";

type ProfileData = {
  id: string;
  displayName: string;
  email: string;
  image: string | null;
  coverImage: string | null;
};

export default function ProfileSettingsForm({ user }: { user: ProfileData }) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [image, setImage] = useState(user.image || "");
  const [coverImage, setCoverImage] = useState(user.coverImage || "");
  
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { addToast } = useToast();
  const router = useRouter();

  const handleUpload = async (file: File, type: "image" | "coverImage") => {
    if (type === "image") setIsUploadingImage(true);
    else setIsUploadingCover(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (type === "image") {
        setImage(data.url);
      } else {
        setCoverImage(data.url);
      }
      addToast("Image uploaded successfully!", "success");
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Failed to upload image",
        "error"
      );
    } finally {
      if (type === "image") setIsUploadingImage(false);
      else setIsUploadingCover(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, image, coverImage }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      addToast("Profile updated successfully!", "success");
      router.refresh();
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Failed to update profile",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-container fade-in">
      <div className="profile-banner-wrapper">
        {isUploadingCover ? (
          <Skeleton variant="rect" className="profile-cover-skeleton" />
        ) : (
          <div 
            className="profile-cover" 
            style={{ backgroundImage: `url(${coverImage || "default-cover.jpg"})` }}
          >
            <label className="upload-btn cover-upload-btn">
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="hidden-input"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleUpload(e.target.files[0], "coverImage");
                }}
              />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              <span>Change Cover</span>
            </label>
          </div>
        )}

        <div className="profile-avatar-wrapper">
          {isUploadingImage ? (
            <Skeleton variant="circle" className="profile-avatar-skeleton" />
          ) : (
            <div className="profile-avatar-container">
              <img 
                src={image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=random`} 
                alt={user.displayName} 
                className="profile-avatar"
              />
              <label className="upload-btn avatar-upload-btn">
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden-input"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleUpload(e.target.files[0], "image");
                  }}
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        <h2>{user.displayName}</h2>
        <p className="profile-email">{user.email}</p>

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="form-input"
              required
              minLength={2}
              maxLength={50}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary profile-save-btn"
            disabled={isSaving || isUploadingCover || isUploadingImage}
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
