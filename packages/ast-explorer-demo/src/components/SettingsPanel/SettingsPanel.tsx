import {
  getLintRuleLabel,
  lintRuleNames,
  type LintRuleName,
  type LintSettings,
} from "../../lib/lint-utils.js";
import "./SettingsPanel.css";

export type SettingsPanelProps = {
  lintSettings: LintSettings;
  setLintSettings: React.Dispatch<React.SetStateAction<LintSettings>>;
};
export function SettingsPanel({ lintSettings, setLintSettings }: SettingsPanelProps) {
  return (
    <div className="settings-panel__content">
      <h2 className="settings-panel__title">Lint rules</h2>
      <label className="settings-panel__setting settings-panel__setting--preset">
        <input
          type="checkbox"
          checked={lintSettings.preset}
          onChange={(event) =>
            setLintSettings((current) => ({ ...current, preset: event.target.checked }))
          }
        />
        remark-preset-lint-gherkin-lint
      </label>
      <div className="settings-panel__rule-list">
        {lintRuleNames.map((name: LintRuleName) => (
          <label className="settings-panel__setting" key={name}>
            <input
              type="checkbox"
              checked={lintSettings[name]}
              disabled={lintSettings.preset}
              onChange={(event) =>
                setLintSettings((current) => ({ ...current, [name]: event.target.checked }))
              }
            />
            {getLintRuleLabel(name)}
          </label>
        ))}
      </div>
    </div>
  );
}
