"use client";

import { useState } from "react";
import AddEntryForm from "@/components/logging/AddEntryForm";

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={`fab ${isOpen ? "fab-active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close" : "Add movie"}
        id="fab-button"
      >
        <span className="fab-icon">{isOpen ? "✕" : "+"}</span>
      </button>

      {isOpen && (
        <>
          <div className="fab-overlay" onClick={() => setIsOpen(false)} />
          <div className="fab-drawer">
            <AddEntryForm
              onSuccess={() => setIsOpen(false)}
              onCancel={() => setIsOpen(false)}
            />
          </div>
        </>
      )}
    </>
  );
}
