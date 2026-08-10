import {
  getLintRuleLabel,
  lintRuleOptionDescriptors,
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
  const optionValues = lintSettings.options as Record<string, unknown> | undefined;
  const updateOption = (name: LintRuleName, key: string, value: unknown) => {
    setLintSettings((current) => ({
      ...current,
      options: {
        ...current.options,
        [name]: { ...(optionValues?.[name] as object), [key]: value },
      },
    }));
  };

  const updateCategorizedOption = (
    name: LintRuleName,
    key: string,
    category: string,
    value: string[],
  ) => {
    setLintSettings((current) => ({
      ...current,
      options: {
        ...current.options,
        [name]: {
          ...(optionValues?.[name] as object),
          [key]: {
            ...((optionValues?.[name] as Record<string, unknown>)?.[key] as object),
            [category]: value,
          },
        },
      },
    }));
  };

  const renderOption = (name: LintRuleName, key: string) => {
    const descriptor = lintRuleOptionDescriptors[name]?.[key];
    if (!descriptor) {
      return null;
    }
    const option = optionValues?.[name] as Record<string, unknown> | string | undefined;
    const current = typeof option === "object" && option ? option[key] : option;
    const value = current ?? "";
    const inputProps = { className: "settings-panel__option-input" };
    const textArea = (category?: string) => {
      const categoryValue = category
        ? ((current as Record<string, string[]>)?.[category] ?? []).join("\n")
        : (Array.isArray(current) ? current : []).join("\n");
      return (
        <textarea
          {...inputProps}
          value={categoryValue}
          rows={2}
          onChange={(event) => {
            const lines = event.target.value.split("\n").filter((line) => line.trim() !== "");
            if (category) {
              updateCategorizedOption(name, key, category, lines);
            } else {
              updateOption(name, key, lines);
            }
          }}
        />
      );
    };
    return (
      <div className="settings-panel__option" key={key}>
        <label className="settings-panel__option-label">{descriptor.label}</label>
        <span className="settings-panel__option-description">
          {descriptor.description}
          {descriptor.default !== undefined ? ` Default: ${descriptor.default}.` : ""}
        </span>
        {descriptor.type === "number" && (
          <input
            {...inputProps}
            type="number"
            min="0"
            value={value as number | string}
            onChange={(event) =>
              updateOption(
                name,
                key,
                event.target.value === "" ? undefined : Number(event.target.value),
              )
            }
          />
        )}
        {descriptor.type === "boolean" && (
          <input
            {...inputProps}
            type="checkbox"
            checked={value === true}
            onChange={(event) => updateOption(name, key, event.target.checked)}
          />
        )}
        {descriptor.type === "select" && (
          <select
            {...inputProps}
            value={value as string}
            onChange={(event) => updateOption(name, key, event.target.value)}
          >
            {descriptor.choices?.map((choice) => (
              <option key={choice} value={choice}>
                {choice}
              </option>
            ))}
          </select>
        )}
        {descriptor.type === "array" && textArea()}
        {descriptor.type === "categorized-array" &&
          (name === "remark-lint-gherkin-scenario-size"
            ? ["Background", "Scenario"].map((category) => (
                <label className="settings-panel__category" key={category}>
                  {category}
                  {textArea(category)}
                </label>
              ))
            : [
                "Global",
                "Feature",
                "Rule",
                "Background",
                "Scenario",
                "ScenarioOutline",
                "Examples",
                "Step",
                "Description",
              ].map((category) => (
                <label className="settings-panel__category" key={category}>
                  {category}
                  {textArea(category)}
                </label>
              )))}
      </div>
    );
  };

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
          <div className="settings-panel__rule" key={name}>
            <label className="settings-panel__setting">
              <input
                type="checkbox"
                checked={lintSettings[name]}
                onChange={(event) =>
                  setLintSettings((current) => ({ ...current, [name]: event.target.checked }))
                }
              />
              {getLintRuleLabel(name)}
            </label>
            {lintRuleOptionDescriptors[name] && (
              <div className="settings-panel__options">
                {Object.keys(lintRuleOptionDescriptors[name]!).map((key) =>
                  renderOption(name, key),
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
