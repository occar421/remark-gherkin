import { useCallback, useMemo, useRef, useState } from "react";
import { findPathAt, getPositionAtPath, processor } from "./ast-utils.js";
import {
  type CursorPositionChangedEvent,
  type DemoEditorHandle,
  EditorPane,
  type Marker,
} from "./EditorPane.js";
import { lintContent } from "./lint-utils.js";
import { useContent } from "./content-hook.ts";
import AstPane from "./AstPane.tsx";
import { useHeader } from "./useHeader.tsx";

export function App() {
  const { content, setContent } = useContent(defaultContent);
  const { lintSettings, render: Header } = useHeader();
  const [focusPath, setFocusPath] = useState<string[] | undefined>(["root"]);
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

      return messages.map(
        (message) =>
          ({
            range: transformRange(message.place),
            ruleId: message.ruleId ?? "",
            source: message.source ?? "",
            reason: message.reason,
            fatal: !!message.fatal,
          }) as Marker,
      );
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
    <div className="app-container">
      <header className="app-header">
        <Header />
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
          <AstPane
            ast={ast}
            focusPath={focusPath}
            onHover={handleTreeHover}
            onBlur={handleTreeBlur}
          />
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
