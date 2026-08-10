import { useCallback, useMemo, useRef, useState } from "react";
import { findPathAt, getPositionAtPath, processor } from "./lib/ast-utils.js";
import {
  type CursorPositionChangedEvent,
  type DemoEditorHandle,
  EditorPane,
} from "./components/EditorPane";
import {
  defaultLintSettings,
  lintContent,
  transformMessageToMarker,
  type LintSettings,
} from "./lib/lint-utils.js";
import { useContent } from "./hooks/useContent.js";
import { AstPane } from "./components/AstPane";
import { Header } from "./components/Header";

export function App() {
  const { content, setContent } = useContent(defaultContent);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lintSettings, setLintSettings] = useState<LintSettings>(defaultLintSettings);
  const [focusPath, setFocusPath] = useState<string[]>(["root"]);
  const demoEditor = useRef<DemoEditorHandle>(null);

  const ast = useMemo(() => {
    try {
      return processor.parse(content);
    } catch (err) {
      return new Error(String(err));
    }
  }, [content]);

  const markers = useMemo(() => {
    try {
      const messages = lintContent(content, lintSettings);
      return messages.map(transformMessageToMarker);
    } catch {
      return [];
    }
  }, [content, lintSettings]);

  const handleChangeCursorPosition = useCallback(
    (e: CursorPositionChangedEvent) => {
      if (!demoEditor.current || !ast) {
        return;
      }

      const path = findPathAt(ast, e.position.lineNumber, e.position.column);
      if (path) {
        setFocusPath(["root", ...path]);
      }
    },
    [ast],
  );

  const handleTreeHover = (path: string[]) => {
    if (!demoEditor.current || Error.isError(ast)) {
      return;
    }

    const position = getPositionAtPath(ast, path.slice(1));
    demoEditor.current?.setDecorations(position ? [position] : []);
  };

  const handleTreeBlur = () => {
    demoEditor.current?.setDecorations([]);
  };

  return (
    <div className="app">
      <header className="app__header">
        <Header
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
          lintSettings={lintSettings}
          setLintSettings={setLintSettings}
        />
      </header>
      <main className="app__main">
        <div className="app__editor-pane">
          <EditorPane
            ref={demoEditor}
            defaultContent={defaultContent}
            content={content}
            markers={markers}
            onChange={(value) => setContent(value ?? "")}
            onDidChangeCursorPosition={handleChangeCursorPosition}
          />
        </div>
        <div className="app__ast-pane">
          <AstPane
            ast={ast}
            focusPath={focusPath}
            onTreeHover={handleTreeHover}
            onTreeBlur={handleTreeBlur}
          />
        </div>
      </main>
    </div>
  );
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
