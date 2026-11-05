"use client";

import { useTheme } from "@/components/providers";
import { Icon } from "@/components/icon";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button className="icon-button theme-toggle" onClick={toggleTheme} aria-label={theme === "dark" ? "Activar tema claro" : "Activar tema oscuro"} title="Cambiar tema">
    <Icon name={theme === "dark" ? "sun" : "moon"} size={18}/>
  </button>;
}
