import { JsonViewer } from "../JsonViewer";
import { TreeConfig } from "../TreeConfig";
import { useMemo } from "react";
import { filterNode } from "../../lib/ast-utils.js";
import type { Root } from "mdast";
import "../../styles/tokens.css";
import "./AstPane.css";

type Props = {
  ast: Root | Error;
  focusPath: string[] | undefined;
  onTreeHover: (path: string[]) => void;
  onTreeBlur: () => void;
};
export function AstPane({ ast, focusPath, onTreeHover, onTreeBlur }: Props) {
  const { hideLocation, hideMethods, hideEmpty, hideType, autofocus } = TreeConfig.useSettings();

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
