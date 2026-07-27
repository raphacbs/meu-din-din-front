export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_PREFERENCE_STORAGE_KEY = "theme-preference:v1";
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";

export function resolveTheme(
  preference: ThemePreference,
  prefersDark: boolean,
): ResolvedTheme {
  if (preference === "system") {
    return prefersDark ? "dark" : "light";
  }

  return preference;
}

export function readThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return DEFAULT_THEME_PREFERENCE;
  }

  try {
    const stored = localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage indisponível (privado, quota, etc.)
  }

  return DEFAULT_THEME_PREFERENCE;
}

export function writeThemePreference(preference: ThemePreference): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, preference);
  } catch {
    // ignore
  }
}

export function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyThemeToDocument(resolved: ResolvedTheme): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.style.colorScheme = resolved;
}

export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_PREFERENCE_STORAGE_KEY)};var p=localStorage.getItem(k)||${JSON.stringify(DEFAULT_THEME_PREFERENCE)};var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var r=p==="dark"||(p==="system"&&d)?"dark":"light";document.documentElement.setAttribute("data-theme",r);document.documentElement.style.colorScheme=r;}catch(e){}})();`;
