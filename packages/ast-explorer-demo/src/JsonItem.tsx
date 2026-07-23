import { useEffect, useRef, useState } from "react";
import { testGherkinNode } from "mdast-util-gherkin";
import type { Node } from "mdast";

type Props = {
  label: string;
  value: unknown;
  path: string[];
  activePath: string[] | null;
  onHover?: (path: string[]) => void;
  onBlur?: () => void;
};

export function JsonItem({ label, value, path, activePath, onHover, onBlur }: Props) {
  const [collapsed, setCollapsed] = useState(
    path.length !== 1 && path[path.length - 1] !== "children",
  );
  const isObject = value !== null && typeof value === "object";
  const pathStr = path.join(".");
  const activePathStr = activePath?.join(".");
  const isExact = activePathStr === pathStr;
  const isParent = activePathStr?.startsWith(pathStr + ".");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExact && ref.current) ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isExact]);
  useEffect(() => {
    if (isParent) setCollapsed(false);
  }, [isParent]);

  if (!isObject) {
    let typeClass = "json-view-number";
    if (typeof value === "string") typeClass = "json-view-string";
    if (typeof value === "boolean") typeClass = "json-view-boolean";
    if (value === null) typeClass = "json-view-null";
    return (
      <div
        className={`json-view-item ${isExact ? "json-view-active" : ""}`}
        ref={ref}
        onMouseEnter={() => onHover?.(path)}
        onMouseLeave={() => onBlur?.()}
      >
        <span className="json-view-label">{label}</span>
        <span className="json-view-punctuation">:</span>
        <span className={`json-view-value ${typeClass}`}>{JSON.stringify(value)}</span>
      </div>
    );
  }

  const isArray = Array.isArray(value);
  return (
    <div
      className={`json-view-item ${isExact ? "json-view-active" : ""}`}
      ref={ref}
      onMouseEnter={() => onHover?.(path)}
      onMouseLeave={() => onBlur?.()}
    >
      <div
        className="json-view-collapsible"
        onClick={(e) => {
          e.stopPropagation();
          setCollapsed(!collapsed);
        }}
      >
        <span
          className={`json-view-toggle ${collapsed ? "json-view-expand" : "json-view-collapse"}`}
        >
          {collapsed ? "+" : "-"}
        </span>
        <span className="json-view-label">{getItemLabel(label, value)}</span>
        <span className="json-view-punctuation">
          : {isArray ? "[" : "{"}
          {collapsed && (isArray ? " ... ]" : " ... }")}
        </span>
      </div>
      {!collapsed && (
        <>
          <div className="json-view-children">
            {Object.entries(value).map(([key, val]) => (
              <JsonItem
                key={key}
                label={getItemLabel(key, val)}
                value={val}
                path={[...path, key]}
                activePath={activePath}
                onHover={onHover}
                onBlur={onBlur}
              />
            ))}
          </div>
          <div className="json-view-punctuation end">{isArray ? "]" : "}"}</div>
        </>
      )}
    </div>
  );
}

export function getItemLabel(label: string, value: unknown): string {
  if (isMdastNode(value)) {
    if (testGherkinNode()(value)) {
      return `${value.type} (${value.data.gherkin.type})`;
    }
    return value.type;
  }

  return label;
}

function isMdastNode(value: unknown): value is Node {
  return typeof value === "object" && !!value && "type" in value && typeof value.type === "string";
}
