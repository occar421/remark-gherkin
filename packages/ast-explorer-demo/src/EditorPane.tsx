import { Editor } from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import "./EditorPane.css";

type EditorPaneProps = {
  content: string;
  isDark: boolean;
  onChange: (value: string | undefined) => void;
  onMount: OnMount;
  onReset: () => void;
};

export function EditorPane({ content, isDark, onChange, onMount, onReset }: EditorPaneProps) {
  return (
    <div className="editor-pane">
      <button className="reset-button" type="button" onClick={onReset}>
        Reset content
      </button>
      <Editor
        height="100%"
        defaultLanguage="markdown"
        theme={isDark ? "vs-dark" : "light"}
        value={content}
        onChange={onChange}
        onMount={onMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fixedOverflowWidgets: true,
        }}
      />
    </div>
  );
}
