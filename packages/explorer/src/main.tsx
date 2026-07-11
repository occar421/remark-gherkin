import React, { useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Editor } from "@monaco-editor/react";
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

function App() {
  const [content, setContent] = useState(initialContent);

  const ast = useMemo(() => {
    try {
      return processor.parse(content);
    } catch (err) {
      return { error: String(err) };
    }
  }, [content]);

  return (
    <div className="app-container">
      <header>
        <h1>Remark Gherkin AST Explorer</h1>
      </header>
      <main>
        <div className="editor-pane">
          <Editor
            height="100%"
            defaultLanguage="markdown"
            theme="vs-dark"
            value={content}
            onChange={(value) => setContent(value ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
        <div className="ast-pane">
          <JsonView data={ast} shouldExpandNode={() => true} style={defaultStyles} />
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
