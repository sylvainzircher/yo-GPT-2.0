"use client";
import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeSwap() {
  const [theme, setTheme] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("theme") || "light"
      : "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div>
      <label className="swap swap-rotate p-2 btn btn-square btn-ghost ml-2">
        <input
          type="checkbox"
          checked={theme === "dark"}
          onChange={toggleTheme}
        />
        <Sun className="swap-off" size={16} />
        <Moon className="swap-on" size={16} />
      </label>
    </div>
  );
}
