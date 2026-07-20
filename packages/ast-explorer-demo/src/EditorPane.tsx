import { type Ref, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { Editor, type OnMount, type Monaco } from "@monaco-editor/react";
import "./EditorPane.css";

type IStandaloneCodeEditor = Parameters<OnMount>[0];

type PositionInMarker = {
  line: number;
  column: number;
};

type MarkerRange = {
  start: PositionInMarker;
  end: PositionInMarker;
};

/**
 * A position in the editor.
 */
type PositionInEditor = {
  /**
   * line number (starts at 1)
   */
  readonly lineNumber: number;
  /**
   * column (the first character in a line is between column 1 and column 2)
   */
  readonly column: number;
};

export type Marker = {
  range: MarkerRange;
  source: string;
  reason: string;
  ruleId: string;
  fatal: boolean;
};

export type CursorPositionChangedEvent = {
  /**
   * Primary cursor's position.
   */
  readonly position: PositionInEditor;
};

export type DemoEditorHandle = {
  setDecorations: (ranges: MarkerRange[]) => void;
};

export type Props = {
  ref?: Ref<DemoEditorHandle>;
  defaultContent?: string;
  content: string;
  markers?: Marker[];
  onChange?: (value: string | undefined) => void;
  onDidChangeCursorPosition?: (e: CursorPositionChangedEvent) => void;
};

export function EditorPane({
  ref,
  defaultContent = "",
  content,
  markers = [],
  onChange,
  onDidChangeCursorPosition,
}: Props) {
  const editor = useRef<IStandaloneCodeEditor>(null);
  const monaco = useRef<Monaco>(null);
  const decorations = useRef<{ clear: () => void }>(null);

  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const showMarkers = useCallback(() => {
    if (!editor.current || !monaco.current) {
      return;
    }

    const model = editor.current?.getModel();

    if (model) {
      monaco.current?.editor.setModelMarkers(
        model,
        "markers",
        markers.map((marker) => ({
          startLineNumber: marker.range.start.line,
          startColumn: marker.range.start.column,
          endLineNumber: marker.range.end.line,
          endColumn: marker.range.end.column,
          message: `${marker.source ? `${marker.source}: ` : ""}${marker.reason} (${marker.ruleId})`,
          severity: marker.fatal ? 8 : 4,
        })),
      );
    }
  }, [markers]);

  const handleDidMount = useCallback<OnMount>((e, m) => {
    editor.current = e;
    monaco.current = m;

    showMarkers();
  }, []);

  const handleReset = useCallback(() => {
    const model = editor.current?.getModel();
    if (model) {
      editor.current?.executeEdits("reset-content", [
        {
          range: model.getFullModelRange(),
          text: defaultContent,
          forceMoveMarkers: true,
        },
      ]);
    } else {
      onChange?.(defaultContent);
    }
  }, [onChange, defaultContent]);

  useEffect(() => {
    const disposal = editor.current?.onDidChangeCursorPosition((e) => {
      onDidChangeCursorPosition?.(e);
    });
    return () => disposal?.dispose();
  }, [onDidChangeCursorPosition]);

  useEffect(() => {
    showMarkers();
  }, [markers]);

  useImperativeHandle(ref, () => ({
    setDecorations(ranges: MarkerRange[]) {
      decorations.current?.clear?.();

      if (!editor.current) {
        return;
      }

      decorations.current = editor.current?.createDecorationsCollection(
        ranges.map((range) => ({
          range: {
            startLineNumber: range.start.line,
            startColumn: range.start.column,
            endLineNumber: range.end.line,
            endColumn: range.end.column,
          },
          options: { inlineClassName: "ast-source-highlight" },
        })),
      );
    },
  }));

  return (
    <div className="editor-pane">
      <button className="reset-button" type="button" onClick={handleReset}>
        Reset content
      </button>
      <Editor
        height="100%"
        defaultLanguage="markdown"
        theme={isDark ? "vs-dark" : "light"}
        value={content}
        onChange={onChange}
        onMount={handleDidMount}
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
