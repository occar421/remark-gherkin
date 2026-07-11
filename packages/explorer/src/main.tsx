import React, { useState, useMemo, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Editor } from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
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

function findPathAt(
  node: any,
  line: number,
  column: number,
  currentPath: string[] = [],
): string[] | null {
  if (!node || typeof node !== "object") return null;

  if (node.position) {
    const { start, end } = node.position;
    if (
      line < start.line ||
      line > end.line ||
      (line === start.line && column < start.column) ||
      (line === end.line && column > end.column)
    ) {
      return null;
    }
  }

  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const p = findPathAt(node[i], line, column, [...currentPath, String(i)]);
      if (p) return p;
    }
  } else {
    for (const key in node) {
      if (key === "position") continue;
      const p = findPathAt(node[key], line, column, [...currentPath, key]);
      if (p) return p;
    }
  }

  return node.position ? currentPath : null;
}

function JsonItem({
  label,
  value,
  path,
  activePath,
}: {
  label: string;
  value: any;
  path: string[];
  activePath: string[] | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const isObject = value !== null && typeof value === "object";
  const pathStr = path.join(".");
  const activePathStr = activePath?.join(".");
  const isExact = activePathStr === pathStr;
  const isParent = activePathStr?.startsWith(pathStr + ".");

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExact && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isExact]);

  useEffect(() => {
    if (isParent && collapsed) {
      setCollapsed(false);
    }
  }, [isParent, collapsed]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed(!collapsed);
  };

  if (!isObject) {
    let typeClass = "json-view-number";
    if (typeof value === "string") typeClass = "json-view-string";
    if (typeof value === "boolean") typeClass = "json-view-boolean";
    if (value === null) typeClass = "json-view-null";

    return (
      <div className={`json-view-item ${isExact ? "json-view-active" : ""}`} ref={ref}>
        <span className="json-view-label" onClick={() => setCollapsed(!collapsed)}>
          {label}
        </span>
        <span className="json-view-punctuation">:</span>
        <span className={`json-view-value ${typeClass}`}>{JSON.stringify(value)}</span>
      </div>
    );
  }

  const isArray = Array.isArray(value);
  const keys = Object.keys(value);

  return (
    <div className={`json-view-item ${isExact ? "json-view-active" : ""}`} ref={ref}>
      <div className="json-view-collapsible" onClick={toggle}>
        <span className="json-view-toggle">{collapsed ? "▶" : "▼"}</span>
        <span className="json-view-label">{label}</span>
        <span className="json-view-punctuation">: </span>
        <span className="json-view-punctuation">{isArray ? "[" : "{"}</span>
        {collapsed && (
          <span className="json-view-punctuation">{isArray ? " ... ]" : " ... }"}</span>
        )}
      </div>
      {!collapsed && (
        <>
          <div className="json-view-children">
            {keys.map((key) => (
              <JsonItem
                key={key}
                label={key}
                value={value[key]}
                path={[...path, key]}
                activePath={activePath}
              />
            ))}
          </div>
          <div className="json-view-punctuation" style={{ marginLeft: "7px" }}>
            {isArray ? "]" : "}"}
          </div>
        </>
      )}
    </div>
  );
}

function JsonViewer({ data, activePath }: { data: any; activePath: string[] | null }) {
  return (
    <div className="json-view-container">
      <JsonItem label="root" value={data} path={["root"]} activePath={activePath} />
    </div>
  );
}

function App() {
  const [content, setContent] = useState(initialContent);
  const [tab, setTab] = useState<"tree" | "json">("json");
  const [hideLocation, setHideLocation] = useState(true);
  const [hideMethods, setHideMethods] = useState(true);
  const [hideEmpty, setHideEmpty] = useState(true);
  const [hideType, setHideType] = useState(false);
  const [autofocus, setAutofocus] = useState(true);
  const [editor, setEditor] = useState<any>(null);
  const [activePath, setActivePath] = useState<string[] | null>(null);

  const handleEditorDidMount: OnMount = (e) => {
    setEditor(e);
    e.focus();
  };

  const { fullAst, ast, timing } = useMemo(() => {
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
      return { fullAst: tree, ast: filtered, timing: Math.round(end - start) };
    } catch (err) {
      return { fullAst: null, ast: { error: String(err) }, timing: 0 };
    }
  }, [content, hideLocation, hideMethods, hideEmpty, hideType]);

  useEffect(() => {
    if (!editor || !autofocus || !fullAst) return;

    const disposable = editor.onDidChangeCursorPosition((e: any) => {
      const path = findPathAt(fullAst, e.position.lineNumber, e.position.column);
      if (path) {
        setActivePath(["root", ...path]);
      }
    });

    return () => disposable.dispose();
  }, [editor, autofocus, fullAst]);

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
        <div className={`ast-pane ${autofocus ? "autofocus-enabled" : ""}`}>
          {tab === "json" ? (
            <JsonViewer data={ast} activePath={activePath} />
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
