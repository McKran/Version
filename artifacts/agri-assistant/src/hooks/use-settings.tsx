import React, { createContext, useContext, useState, useEffect } from "react";
import type { WeightUnit, TargetMarket } from "@/lib/country-data";
import { convertFromTon, convertCurrency, getCurrencySymbol } from "@/lib/country-data";
import { type Language, type Translations, getTranslation } from "@/lib/i18n";

export type { WeightUnit, TargetMarket, Language, Translations };

export interface AppSettings {
  onboardingCompleted: boolean;
  language: Language;
  countryCode: string;
  regionCode: string;
  regionName: string;
  provinceCode: string;
  provinceName: string;
  cityCode: string;
  cityName: string;
  cityLat: number | null;
  cityLon: number | null;
  currency: string;
  weightUnit: WeightUnit;
  preferredCrops: string[];
  preferredCropIds: number[];
  targetMarket: TargetMarket;
  theme: "light" | "dark" | "system";
}

const DEFAULT_SETTINGS: AppSettings = {
  onboardingCompleted: false,
  language: "en",
  countryCode: "PH",
  regionCode: "",
  regionName: "",
  provinceCode: "",
  provinceName: "",
  cityCode: "",
  cityName: "",
  cityLat: null,
  cityLon: null,
  currency: "PHP",
  weightUnit: "kilogram",
  preferredCrops: [],
  preferredCropIds: [],
  targetMarket: "local",
  theme: "light",
};

const STORAGE_KEY = "agri_settings_v7";

function applyTheme(theme: "light" | "dark" | "system") {
  if (typeof document === "undefined") return;
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (theme === "system") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  } else {
    document.documentElement.classList.remove("dark");
  }
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.theme === "system" || !parsed.theme) {
        parsed.theme = "light";
      }
      const settings = { ...DEFAULT_SETTINGS, ...parsed };
      applyTheme(settings.theme);
      return settings;
    }
  } catch {}
  applyTheme(DEFAULT_SETTINGS.theme);
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

interface SettingsContextType {
  settings: AppSettings;
  t: Translations;
  updateSettings: (partial: Partial<AppSettings>) => void;
  completeOnboarding: (data: Partial<AppSettings>) => void;
  resetOnboarding: () => void;
  formatPrice: (usdPricePerTon: number) => string;
  currencySymbol: string;
  unitLabel: string;
  fullLocationLabel: string;
  setLanguage: (lang: Language) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const t = getTranslation(settings.language || "en");

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      if (partial.theme) applyTheme(partial.theme);
      return next;
    });
  };

  const setLanguage = (lang: Language) => {
    updateSettings({ language: lang });
  };

  const completeOnboarding = (data: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...data, onboardingCompleted: true, countryCode: "PH", currency: "PHP" };
      saveSettings(next);
      return next;
    });
  };

  const resetOnboarding = () => {
    setSettings(prev => {
      const next = { ...prev, onboardingCompleted: false };
      saveSettings(next);
      return next;
    });
  };

  const currencySymbol = "₱";

  const unitLabel = settings.weightUnit === "gram"
    ? "g"
    : settings.weightUnit === "kilogram"
    ? "kg"
    : "MT";

  const formatPrice = (usdPricePerTon: number): string => {
    const converted = convertCurrency(convertFromTon(usdPricePerTon, settings.weightUnit), "PHP");
    const formatted = new Intl.NumberFormat("en-PH", {
      minimumFractionDigits: converted < 1 ? 4 : 0,
      maximumFractionDigits: converted < 1 ? 4 : 2,
    }).format(converted);
    return `₱${formatted}`;
  };

  const parts = [
    settings.cityName,
    settings.provinceName || settings.regionName,
    "Philippines",
  ].filter(Boolean);
  const fullLocationLabel = parts.join(", ");

  return (
    <SettingsContext.Provider value={{ settings, t, updateSettings, completeOnboarding, resetOnboarding, formatPrice, currencySymbol, unitLabel, fullLocationLabel, setLanguage }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
}
