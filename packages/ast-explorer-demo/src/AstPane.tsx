import { JsonViewer } from "./JsonViewer.tsx";
import { useTreeConfig } from "./useTreeConfig.tsx";
import { useMemo } from "react";
import { filterNode } from "./ast-utils.ts";
import type { Root } from "mdast";

type Props = {
  ast: Root | Error;
  focusPath: string[] | undefined;
  onTreeHover: (path: string[]) => void;
  onTreeBlur: () => void;
};
export default function AstPane({ ast, focusPath, onTreeHover, onTreeBlur }: Props) {
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
          onHover={onTreeHover}
          onBlur={onTreeBlur}
        />
      </div>
    </div>
  );
}
