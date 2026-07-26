import { useCallback, useMemo, useRef, useState } from "react";
import { filterNode, findPathAt, getPositionAtPath, processor } from "./ast-utils.js";
import {
  type CursorPositionChangedEvent,
  type DemoEditorHandle,
  EditorPane,
  type Marker,
} from "./EditorPane.js";
import { JsonViewer } from "./JsonViewer.js";
import { lintContent } from "./lint-utils.js";
import { useContent } from "./content-hook.ts";
import { useTreeConfig } from "./useTreeConfig.tsx";
import { useSettingsPanel } from "./useSettingsPanel.tsx";

export function App() {
  const { content, setContent } = useContent(defaultContent);
  const {
    hideLocation,
    hideMethods,
    hideEmpty,
    hideType,
    autofocus,
    render: TreeConfig,
  } = useTreeConfig();
  const { lintSettings, render: SettingsPanel } = useSettingsPanel();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activePath, setActivePath] = useState<string[] | null>(null);
  const demoEditor = useRef<DemoEditorHandle>(null);

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

  const handleChangeCursorPosition = useCallback(
    (e: CursorPositionChangedEvent) => {
      if (!demoEditor.current || !autofocus || !fullAst) {
        return;
      }

      const path = findPathAt(fullAst, e.position.lineNumber, e.position.column);
      if (path) {
        setActivePath(["root", ...path]);
      }
    },
    [autofocus, fullAst],
  );

  const markers: Marker[] = lintMessages.map((message) => ({
    range: transformRange(message.place),
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
    demoEditor.current?.setDecorations(position ? [position] : []);
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
              <SettingsPanel />
            </aside>
          )}
          <header>
            <TreeConfig />
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

const emptyRange = { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } };

function transformRange(range: ReturnType<typeof lintContent>[number]["place"]): Marker["range"] {
  if (!range) {
    return emptyRange;
  }

  if ("start" in range) {
    return range;
  }

  if ("offset" in range) {
    return {
      start: { line: range.line, column: range.column },
      end: { line: range.line, column: range.column + 1 },
    };
  }

  return emptyRange;
}

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
