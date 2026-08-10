import {
  getLintRuleLabel,
  lintRuleNames,
  type LintRuleName,
  type LintSettings,
} from "../../lib/lint-utils.js";
import "../../styles/tokens.css";
import "./SettingsPanel.css";

export type SettingsPanelProps = {
  lintSettings: LintSettings;
  setLintSettings: React.Dispatch<React.SetStateAction<LintSettings>>;
};
export function SettingsPanel({ lintSettings, setLintSettings }: SettingsPanelProps) {
  return (
    <div>
      <h2>Lint rules</h2>
      <label className="lint-setting lint-preset">
        <input
          type="checkbox"
          checked={lintSettings.preset}
          onChange={(event) =>
            setLintSettings((current) => ({ ...current, preset: event.target.checked }))
          }
        />
        remark-preset-lint-gherkin-lint
      </label>
      <div className="lint-rule-list">
        {lintRuleNames.map((name: LintRuleName) => (
          <label className="lint-setting" key={name}>
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
