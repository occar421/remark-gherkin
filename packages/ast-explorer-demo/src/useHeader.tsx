import { useCallback, useState } from "react";
import { useSettingsPanel } from "./useSettingsPanel.tsx";

export function useHeader() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { lintSettings, render: SettingsPanel } = useSettingsPanel();

  const render = useCallback(
    () => (
      <div className="header">
        <a className="app-title" href="/" aria-label="AST Explorer home">
          AST Explorer Demo for Markdown with Gherkin
        </a>
        <nav className="app-actions" aria-label="Application links">
          <button
            className="settings-button"
            type="button"
            onClick={() => setSettingsOpen((open) => !open)}
            aria-expanded={settingsOpen}
          >
            ⚙ Settings
          </button>
          <a
            className="repository-link"
            href="https://github.com/occar421/unifiedjs-gherkin"
            target="_blank"
            rel="noreferrer"
          >
            ↗ Repository
          </a>
        </nav>
        {settingsOpen && (
          <aside className="settings-panel" aria-label="Lint settings">
            <SettingsPanel />
          </aside>
        )}
      </div>
    ),
    [settingsOpen],
  );

  return {
    lintSettings,
    render,
  };
}
