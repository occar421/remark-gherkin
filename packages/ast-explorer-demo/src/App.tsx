import { useEffect, useMemo, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { filterNode, findPathAt, getPositionAtPath, processor } from "./ast-utils.js";
import { JsonViewer } from "./JsonViewer.js";

const initialContent = `# Feature: Staying alive

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

export function App() {
  const [content, setContent] = useState(initialContent),
    [tab, setTab] = useState<"tree" | "json">("json");
  const [hideLocation, setHideLocation] = useState(true),
    [hideMethods, setHideMethods] = useState(true),
    [hideEmpty, setHideEmpty] = useState(true),
    [hideType, setHideType] = useState(false),
    [autofocus, setAutofocus] = useState(true);
  const [editor, setEditor] = useState<any>(null),
    [activePath, setActivePath] = useState<string[] | null>(null);
  const decorationRef = useRef<any>(null);
  const { fullAst, ast, timing } = useMemo(() => {
    const start = performance.now();
    try {
      const tree = processor.parse(content);
      return {
        fullAst: tree,
        ast: filterNode(tree, { hideLocation, hideMethods, hideEmpty, hideType }),
        timing: Math.round(performance.now() - start),
      };
    } catch (err) {
      return { fullAst: null, ast: { error: String(err) }, timing: 0 };
    }
  }, [content, hideLocation, hideMethods, hideEmpty, hideType]);
  const handleEditorDidMount: OnMount = (e) => {
    setEditor(e);
    e.focus();
  };
  useEffect(() => {
    if (!editor || !autofocus || !fullAst) return;
    const disposable = editor.onDidChangeCursorPosition((e: any) => {
      const path = findPathAt(fullAst, e.position.lineNumber, e.position.column);
      if (path) setActivePath(["root", ...path]);
    });
    return () => disposable.dispose();
  }, [editor, autofocus, fullAst]);
  const handleTreeHover = (path: string[] | null) => {
    if (!editor) return;
    const position = path ? getPositionAtPath(fullAst, path.slice(1)) : null;
    decorationRef.current?.clear();
    decorationRef.current = position
      ? editor.createDecorationsCollection([
          {
            range: {
              startLineNumber: position.start.line,
              startColumn: position.start.column,
              endLineNumber: position.end.line,
              endColumn: position.end.column,
            },
            options: { inlineClassName: "ast-source-highlight" },
          },
        ])
      : null;
  };
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return (
    <div className="app-container">
      <header className="app-header">
        <a className="app-title" href="/" aria-label="AST Explorer home">
          AST Explorer Demo for Markdown with Gherkin
        </a>
        <nav className="app-actions" aria-label="Application links">
          <button className="settings-button" type="button" disabled title="Settings coming soon">
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
        <div className="editor-pane">
          <Editor
            height="100%"
            defaultLanguage="markdown"
            theme={isDark ? "vs-dark" : "light"}
            value={content}
            onChange={(value) => setContent(value ?? "")}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
        <div className="ast-pane-container">
          <header>
            <div className="header-top">
              <div className="tabs">
                <div
                  className={`tab ${tab === "tree" ? "active" : ""}`}
                  onClick={() => setTab("tree")}
                >
                  Tree
                </div>
                <div
                  className={`tab ${tab === "json" ? "active" : ""}`}
                  onClick={() => setTab("json")}
                >
                  JSON
                </div>
              </div>
              <div className="header-right">{timing}ms</div>
            </div>
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
            {tab === "json" ? (
              <JsonViewer data={ast} activePath={activePath} onHover={handleTreeHover} />
            ) : (
              <div style={{ padding: 20, color: "var(--text)" }}>
                Tree view is not implemented yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
