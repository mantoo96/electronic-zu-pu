import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en } from "./locales/en";
import { zhCN, type TranslationKey } from "./locales/zh-CN";
import { zhTW } from "./locales/zh-TW";

export type Locale = "zh-CN" | "zh-TW" | "en";
export type { TranslationKey };

type Params = Record<string, string | number>;

const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  en
};

export const localeOptions: Array<{ value: Locale; label: string; shortLabel: string }> = [
  { value: "zh-CN", label: "简体中文", shortLabel: "简" },
  { value: "zh-TW", label: "繁體中文", shortLabel: "繁" },
  { value: "en", label: "English", shortLabel: "EN" }
];

export function translate(locale: Locale, key: TranslationKey, params: Params = {}) {
  return Object.entries(params).reduce(
    (value, [name, replacement]) => value.replaceAll(`{${name}}`, String(replacement)),
    dictionaries[locale][key]
  );
}

export type Translate = (key: TranslationKey, params?: Params) => string;

function detectLocale(): Locale {
  try {
    const saved = window.localStorage.getItem("family-tree-locale");
    if (saved === "zh-CN" || saved === "zh-TW" || saved === "en") return saved;
  } catch { /* Storage may be disabled. */ }
  const browserLocale = navigator.language.toLowerCase();
  if (browserLocale.startsWith("zh-tw") || browserLocale.startsWith("zh-hk") || browserLocale.startsWith("zh-mo") || browserLocale.includes("hant")) return "zh-TW";
  if (browserLocale.startsWith("en")) return "en";
  return "zh-CN";
}

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(detectLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = translate(locale, "pageTitle");
    document.querySelector('meta[name="description"]')?.setAttribute("content", translate(locale, "pageDescription"));
    try { window.localStorage.setItem("family-tree-locale", locale); } catch { /* Storage may be disabled. */ }
  }, [locale]);

  const value = useMemo<I18nValue>(() => ({
    locale,
    setLocale,
    t: (key, params) => translate(locale, key, params)
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}

const apiMessages: Record<string, TranslationKey> = {
  "请求失败": "requestFailed",
  "成员不存在": "unknownMember"
};

const apiCodes: Record<string, TranslationKey> = {
  ADMIN_NOT_CONFIGURED: "adminNotConfiguredError",
  TOO_MANY_LOGIN_ATTEMPTS: "tooManyLoginAttempts",
  INVALID_ADMIN_PASSWORD: "invalidAdminPassword",
  ADMIN_REQUIRED: "adminRequired",
  MEMBER_NOT_FOUND: "unknownMember",
  RELATION_MEMBER_NOT_FOUND: "relationMemberNotFound",
  RELATION_EXISTS: "relationAlreadyExists",
  RELATION_NOT_FOUND: "relationNotFound",
  INVALID_IMPORT_FORMAT: "invalidImportFormat",
  VALIDATION_ERROR: "invalidInput",
  INTERNAL_ERROR: "serverError"
};

export function localizeApiMessage(message: string, locale: Locale, code?: string) {
  const key = (code && apiCodes[code]) || apiMessages[message];
  if (key) return translate(locale, key);
  return message;
}
