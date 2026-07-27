"use client";

import { App, ConfigProvider } from "antd";
import ptBR from "antd/locale/pt_BR";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { getAntdTheme } from "@/lib/theme/antd-theme";
import {
  applyThemeToDocument,
  DEFAULT_THEME_PREFERENCE,
  readThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
  writeThemePreference,
} from "@/lib/theme/theme-preference";

interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const preferenceListeners = new Set<() => void>();

function emitPreferenceChange() {
  preferenceListeners.forEach((listener) => listener());
}

function subscribeToPreference(listener: () => void) {
  preferenceListeners.add(listener);
  return () => preferenceListeners.delete(listener);
}

function getPreferenceSnapshot(): ThemePreference {
  return readThemePreference();
}

function getPreferenceServerSnapshot(): ThemePreference {
  return DEFAULT_THEME_PREFERENCE;
}

function subscribeToSystemTheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getSystemSnapshot() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerSnapshot() {
  return false;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useSyncExternalStore(
    subscribeToPreference,
    getPreferenceSnapshot,
    getPreferenceServerSnapshot,
  );

  const systemPrefersDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemSnapshot,
    getServerSnapshot,
  );

  const resolvedTheme = resolveTheme(preference, systemPrefersDark);

  useEffect(() => {
    applyThemeToDocument(resolvedTheme);
  }, [resolvedTheme]);

  const setPreference = (next: ThemePreference) => {
    writeThemePreference(next);
    emitPreferenceChange();
  };

  const themeConfig = useMemo(() => getAntdTheme(resolvedTheme), [resolvedTheme]);

  const contextValue = useMemo(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={themeConfig} locale={ptBR}>
        <App>{children}</App>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
