"use client";

import { useState } from "react";

const DEFAULT_EMOTIONS = [
  "Nostalgic",
  "Thrilled",
  "Tearjerker",
  "Heartwarming",
  "Mind-bending",
  "Suspenseful",
  "Comforting",
  "Disturbing",
  "Inspiring",
  "Hilarious",
];

interface FeelingsPanelProps {
  selected: string[];
  onChange: (emotions: string[]) => void;
  customTags?: string[];
}

export default function FeelingsPanel({
  selected,
  onChange,
  customTags = [],
}: FeelingsPanelProps) {
  const [newTag, setNewTag] = useState("");

  const allTags = [...DEFAULT_EMOTIONS, ...customTags.filter(
    (t) => !DEFAULT_EMOTIONS.includes(t)
  )];

  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  const addCustomTag = () => {
    const trimmed = newTag.trim();
    if (
      trimmed &&
      !allTags.includes(trimmed) &&
      !selected.includes(trimmed)
    ) {
      onChange([...selected, trimmed]);
      setNewTag("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTag();
    }
  };

  return (
    <div className="feelings-panel">
      <label className="feelings-label">How did it make you feel?</label>
      <div className="feelings-tags">
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`feeling-tag ${
              selected.includes(tag) ? "feeling-tag-active" : ""
            }`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="feelings-custom">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add custom feeling..."
          className="feelings-custom-input"
          maxLength={30}
          id="custom-feeling"
        />
        <button
          type="button"
          className="feelings-custom-btn"
          onClick={addCustomTag}
          disabled={!newTag.trim()}
        >
          +
        </button>
      </div>
    </div>
  );
}
