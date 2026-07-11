import React, { useState, useMemo, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Editor } from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { JsonView, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import "./style.css";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";

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

const processor = unified().use(remarkParse).use(remarkGherkin);

function filterNode(
  node: any,
  options: {
    hideLocation: boolean;
    hideMethods: boolean;
    hideEmpty: boolean;
    hideType: boolean;
  },
): any {
  if (Array.isArray(node)) {
    const filtered = node.map((n) => filterNode(n, options));
    return options.hideEmpty
      ? filtered.filter((item) => {
          if (item === null || item === undefined) return false;
          if (Array.isArray(item)) return item.length > 0;
          if (typeof item === "object") return Object.keys(item).length > 0;
          return true;
        })
      : filtered;
  }

  if (node && typeof node === "object") {
    const result: any = {};
    for (const key in node) {
      if (options.hideLocation && key === "position") continue;
      if (options.hideType && key === "type") continue;

      const value = node[key];
      if (options.hideMethods && typeof value === "function") continue;

      const filteredValue = filterNode(value, options);

      if (options.hideEmpty) {
        if (filteredValue === null || filteredValue === undefined) continue;
        if (Array.isArray(filteredValue) && filteredValue.length === 0) continue;
        if (
          typeof filteredValue === "object" &&
          Object.keys(filteredValue).length === 0 &&
          !(filteredValue instanceof Date)
        )
          continue;
      }

      result[key] = filteredValue;
    }
    return result;
  }
  return node;
}

const customDarkTheme = {
  container: "json-view-container",
  label: "json-view-label",
  stringValue: "json-view-string",
  numberValue: "json-view-number",
  booleanValue: "json-view-boolean",
  nullValue: "json-view-null",
  punctuation: "json-view-punctuation",
  collapseIcon: "json-view-collapse",
  expandIcon: "json-view-expand",
};

function App() {
  const [content, setContent] = useState(initialContent);
  const [tab, setTab] = useState<"tree" | "json">("json");
  const [hideLocation, setHideLocation] = useState(true);
  const [hideMethods, setHideMethods] = useState(true);
  const [hideEmpty, setHideEmpty] = useState(true);
  const [hideType, setHideType] = useState(false);
  const [autofocus, setAutofocus] = useState(true);
  const [editor, setEditor] = useState<any>(null);

  const handleEditorDidMount: OnMount = (e) => {
    setEditor(e);
  };

  useEffect(() => {
    if (autofocus && editor) {
      editor.focus();
    }
  }, [autofocus, editor]);

  const { ast, timing } = useMemo(() => {
    const start = performance.now();
    try {
      const tree = processor.parse(content);
      const filtered = filterNode(tree, {
        hideLocation,
        hideMethods,
        hideEmpty,
        hideType,
      });
      const end = performance.now();
      return { ast: filtered, timing: Math.round(end - start) };
    } catch (err) {
      return { ast: { error: String(err) }, timing: 0 };
    }
  }, [content, hideLocation, hideMethods, hideEmpty, hideType]);

  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return (
    <div className="app-container">
      <header>
        <div className="header-top">
          <div className="tabs">
            <div className={`tab ${tab === "tree" ? "active" : ""}`} onClick={() => setTab("tree")}>
              Tree
            </div>
            <div className={`tab ${tab === "json" ? "active" : ""}`} onClick={() => setTab("json")}>
              JSON
            </div>
          </div>
          <div className="header-right">{timing}ms</div>
        </div>
        <div className="header-bottom">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={autofocus}
              onChange={(e) => setAutofocus(e.target.checked)}
            />
            Autofocus
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={hideMethods}
              onChange={(e) => setHideMethods(e.target.checked)}
            />
            Hide methods
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={hideEmpty}
              onChange={(e) => setHideEmpty(e.target.checked)}
            />
            Hide empty keys
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={hideLocation}
              onChange={(e) => setHideLocation(e.target.checked)}
            />
            Hide location data
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={hideType}
              onChange={(e) => setHideType(e.target.checked)}
            />
            Hide type keys
          </label>
        </div>
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
        <div className="ast-pane">
          {tab === "json" ? (
            <JsonView
              data={{ root: ast }}
              shouldExpandNode={() => true}
              style={isDark ? customDarkTheme : defaultStyles}
            />
          ) : (
            <div style={{ padding: 20, color: "var(--text)" }}>
              Tree view is not implemented yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
