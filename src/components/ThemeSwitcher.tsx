"use client";

import { useTheme } from "@/components/ThemeProvider";

const themes = [
  { id: "classic-dark" as const, label: "🌙 Classic Dark", desc: "Sleek blacks" },
  { id: "retro" as const, label: "🍿 Retro", desc: "Warm vintage" },
  { id: "cyberpunk" as const, label: "⚡ Cyberpunk", desc: "Neon glow" },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switcher">
      {themes.map((t) => (
        <button
          key={t.id}
          className={`theme-option ${theme === t.id ? "theme-option-active" : ""}`}
          onClick={() => setTheme(t.id)}
          title={t.desc}
        >
          <span className="theme-option-label">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
