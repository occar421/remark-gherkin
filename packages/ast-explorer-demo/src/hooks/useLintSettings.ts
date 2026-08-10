import { useCallback, useState, type SetStateAction } from "react";
import {
  defaultLintSettings,
  lintRuleNames,
  normalizeLintOptions,
  type LintOptions,
  type LintSettings,
} from "../lib/lint-utils.js";

export const lintSettingsStorageKey = "ast-explorer-demo-lint-settings";

export function mergeStoredLintSettings(value: unknown): LintSettings {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return defaultLintSettings;
  }

  const source = value as Record<string, unknown>;
  const settings: LintSettings = {
    preset: typeof source.preset === "boolean" ? source.preset : defaultLintSettings.preset,
    ...Object.fromEntries(
      lintRuleNames.map((name) => [
        name,
        typeof source[name] === "boolean" ? source[name] : defaultLintSettings[name],
      ]),
    ),
  } as LintSettings;

  if (
    typeof source.options === "object" &&
    source.options !== null &&
    !Array.isArray(source.options)
  ) {
    const options = Object.fromEntries(
      Object.entries(source.options)
        .filter(([name]) => lintRuleNames.includes(name as (typeof lintRuleNames)[number]))
        .map(([name, value]) => [
          name,
          normalizeLintOptions(name as keyof LintOptions, value as never),
        ])
        .filter(([, value]) => value !== undefined),
    ) as LintOptions;
    if (Object.keys(options).length > 0) {
      settings.options = options;
    }
  }

  return settings;
}

export function getStoredLintSettings(): LintSettings {
  try {
    const stored = window.localStorage.getItem(lintSettingsStorageKey);
    return stored === null ? defaultLintSettings : mergeStoredLintSettings(JSON.parse(stored));
  } catch {
    return defaultLintSettings;
  }
}

export function useLintSettings() {
  const [lintSettings, setLintSettings] = useState<LintSettings>(getStoredLintSettings);

  const handleSetLintSettings = useCallback((action: SetStateAction<LintSettings>) => {
    setLintSettings((current) => {
      const next = typeof action === "function" ? action(current) : action;
      try {
        window.localStorage.setItem(lintSettingsStorageKey, JSON.stringify(next));
      } catch {
        // LocalStorage may be unavailable in private browsing or restricted environments.
      }
      return next;
    });
  }, []);

  return { lintSettings, setLintSettings: handleSetLintSettings };
}
