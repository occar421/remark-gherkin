import { JsonViewer } from "./JsonViewer.tsx";
import { useTreeConfig } from "./useTreeConfig.tsx";
import { useMemo } from "react";
import { filterNode } from "./ast-utils.ts";
import type { Root } from "mdast";

type Props = {
  ast: Root | Error;
  focusPath: string[] | undefined;
  onHover: (path: string[]) => void;
  onBlur: () => void;
};
export default function AstPane({ ast, focusPath, onHover, onBlur }: Props) {
  const {
    hideLocation,
    hideMethods,
    hideEmpty,
    hideType,
    autofocus,
    render: TreeConfig,
  } = useTreeConfig();

  const filteredAst = useMemo(
    () =>
      Error.isError(ast)
        ? ast
        : filterNode(ast, { hideLocation, hideMethods, hideEmpty, hideType }),
    [ast, hideLocation, hideMethods, hideEmpty, hideType],
  );

  return (
    <div>
      <header>
        <TreeConfig />
      </header>
      <div className={`ast-pane ${autofocus ? "autofocus-enabled" : ""}`}>
        <JsonViewer
          data={filteredAst}
          focusPath={autofocus ? focusPath : undefined}
          onHover={onHover}
          onBlur={onBlur}
        />
      </div>
    </div>
  );
}
