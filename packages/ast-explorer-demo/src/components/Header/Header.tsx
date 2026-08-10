import type { Dispatch, SetStateAction } from "react";
import type { LintSettings } from "../../lib/lint-utils.js";
import { SettingsPanel } from "../SettingsPanel/index.js";
import "../../styles/tokens.css";
import "./Header.css";

export type HeaderProps = {
  settingsOpen: boolean;
  setSettingsOpen: Dispatch<SetStateAction<boolean>>;
  lintSettings: LintSettings;
  setLintSettings: Dispatch<SetStateAction<LintSettings>>;
};
export function Header({
  settingsOpen,
  setSettingsOpen,
  lintSettings,
  setLintSettings,
}: HeaderProps) {
  return (
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
          <SettingsPanel lintSettings={lintSettings} setLintSettings={setLintSettings} />
        </aside>
      )}
    </div>
  );
}
