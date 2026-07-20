import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { filterNode, findPathAt, getPositionAtPath, processor } from "./ast-utils.js";
import {
  type CursorPositionChangedEvent,
  type DemoEditorHandle,
  EditorPane,
  type Marker,
} from "./EditorPane.js";
import { JsonViewer } from "./JsonViewer.js";
import {
  defaultLintSettings,
  getLintRuleLabel,
  lintContent,
  lintRuleNames,
  type LintRuleName,
  type LintSettings,
} from "./lint-utils.js";

const defaultContent = `# Feature: Staying alive

This is about actually staying alive,
not the [Bee Gees song](https://www.youtube.com/watch?v=I_izvAbhExY).

## Rule: If you don't eat you die

![xkcd](https://imgs.xkcd.com/comics/lunch_2x.png)

\`@important\` \`@essential\`
### Scenario Outline: eating

* Given there are <start> cucumbers
* When I eat <eat> cucumbers
* Then I should have <left> cucumbers

#### Examples:

  | start | eat | left |
  | ----- | --- | ---- |
  |    12 |   5 |    7 |
  |    20 |   5 |   15 |
`;

const contentStorageKey = "ast-explorer-demo-content";

function getStoredContent() {
  try {
    return window.localStorage.getItem(contentStorageKey) ?? defaultContent;
  } catch {
    return defaultContent;
  }
}

export function App() {
  const [content, setContent] = useState(getStoredContent);
  const [hideLocation, setHideLocation] = useState(true),
    [hideMethods, setHideMethods] = useState(true),
    [hideEmpty, setHideEmpty] = useState(true),
    [hideType, setHideType] = useState(false),
    [autofocus, setAutofocus] = useState(true);
  const [activePath, setActivePath] = useState<string[] | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lintSettings, setLintSettings] = useState<LintSettings>(defaultLintSettings);
  const demoEditor = useRef<DemoEditorHandle>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(contentStorageKey, content);
    } catch {
      // LocalStorage may be unavailable in private browsing or restricted environments.
    }
  }, [content]);
  const { fullAst, ast } = useMemo(() => {
    try {
      const tree = processor.parse(content);
      return {
        fullAst: tree,
        ast: filterNode(tree, { hideLocation, hideMethods, hideEmpty, hideType }),
      };
    } catch (err) {
      return { fullAst: null, ast: { error: String(err) } };
    }
  }, [content, hideLocation, hideMethods, hideEmpty, hideType]);
  const lintMessages = useMemo(() => {
    try {
      return lintContent(content, lintSettings);
    } catch {
      return [];
    }
  }, [content, lintSettings]);
  const handleChangeCursorPosition = useCallback((e: CursorPositionChangedEvent) => {
    if (!demoEditor.current || !autofocus || !fullAst) {
      return;
    }

    const path = findPathAt(fullAst, e.position.lineNumber, e.position.column);
    if (path) setActivePath(["root", ...path]);
  }, []);

  const markers: Marker[] = lintMessages.map((message) => ({
    range: {
      start: {
        lineNumber: message.line ?? 1,
        column: message.column ?? 1,
      },
      end: {
        lineNumber: message.line ?? 1,
        column: (message.column ?? 1) + 1,
      },
    },
    ruleId: message.ruleId ?? "",
    source: message.source ?? "",
    reason: message.reason,
    fatal: !!message.fatal,
  }));

  const handleTreeHover = (path: string[]) => {
    if (!demoEditor.current) {
      return;
    }

    const position = getPositionAtPath(fullAst!, path.slice(1));
    demoEditor.current?.setDecorations(
      position
        ? [
            {
              start: {
                lineNumber: position?.start.line,
                column: position?.start.column,
              },
              end: {
                lineNumber: position?.end.line,
                column: position?.end.column,
              },
            },
          ]
        : [],
    );
  };
  const handleTreeBlur = () => {
    demoEditor.current?.setDecorations([]);
  };

  return (
    <div className="app-container">
      <header className="app-header">
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
      </header>
      <main>
        <div className="editor-pane-wrapper">
          <EditorPane
            ref={demoEditor}
            defaultContent={defaultContent}
            content={content}
            markers={markers}
            onChange={(value) => setContent(value ?? "")}
            onDidChangeCursorPosition={handleChangeCursorPosition}
          />
        </div>
        <div className="ast-pane-container">
          {settingsOpen && (
            <aside className="settings-panel" aria-label="Lint settings">
              <h2>Lint rules</h2>
              <label className="lint-setting lint-preset">
                <input
                  type="checkbox"
                  checked={lintSettings.preset}
                  onChange={(event) =>
                    setLintSettings((current) => ({
                      ...current,
                      preset: event.target.checked,
                    }))
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
                        setLintSettings((current) => ({
                          ...current,
                          [name]: event.target.checked,
                        }))
                      }
                    />
                    {getLintRuleLabel(name)}
                  </label>
                ))}
              </div>
            </aside>
          )}
          <header>
            <div className="header-bottom">
              {[
                ["Autofocus", autofocus, setAutofocus],
                ["Hide methods", hideMethods, setHideMethods],
                ["Hide empty keys", hideEmpty, setHideEmpty],
                ["Hide location data", hideLocation, setHideLocation],
                ["Hide type keys", hideType, setHideType],
              ].map(([label, checked, setter]: any) => (
                <label className="checkbox-label" key={label as string}>
                  <input
                    type="checkbox"
                    checked={checked as boolean}
                    onChange={(e) => setter(e.target.checked)}
                  />
                  {label as string}
                </label>
              ))}
            </div>
          </header>
          <div className={`ast-pane ${autofocus ? "autofocus-enabled" : ""}`}>
            <JsonViewer
              data={ast}
              activePath={activePath}
              onHover={handleTreeHover}
              onBlur={handleTreeBlur}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
