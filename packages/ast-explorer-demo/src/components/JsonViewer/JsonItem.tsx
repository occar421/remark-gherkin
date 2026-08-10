import { useEffect, useRef, useState } from "react";
import { testGherkinNode } from "mdast-util-gherkin";
import type { Node } from "mdast";

type Props = {
  label: string;
  value: unknown;
  path: string[];
  focusPath?: string[];
  onHover?: (path: string[]) => void;
  onBlur?: () => void;
};

export function JsonItem({ label, value, path, focusPath, onHover, onBlur }: Props) {
  const isObject = value !== null && typeof value === "object";
  const pathStr = path.join(".");
  const activePathStr = focusPath?.join(".");

  const shouldFocus = !!activePathStr;
  const isExact = activePathStr === pathStr;
  const isParent = !!activePathStr?.startsWith(pathStr + ".");
  const isChildren = `${activePathStr}.children` === pathStr;

  const [collapsed, setCollapsed] = useState(!!activePathStr);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldFocus && isExact && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setCollapsed(false);
    }
  }, [isExact, shouldFocus]);

  useEffect(() => {
    if (!shouldFocus) {
      return;
    }

    if (isParent || isExact || isChildren) {
      setCollapsed(false);
    } else {
      setCollapsed(true);
    }
  }, [isParent, isExact, isChildren, shouldFocus]);

  if (!isObject) {
    const typeClass =
      value === null
        ? "json-viewer__value--null"
        : typeof value === "boolean"
          ? "json-viewer__value--boolean"
          : typeof value === "string"
            ? "json-viewer__value--string"
            : "json-viewer__value--number";

    return (
      <div
        className={`json-viewer__item ${isExact ? "json-viewer__item--active" : ""}`}
        ref={ref}
        onMouseEnter={() => onHover?.(path)}
        onMouseLeave={() => onBlur?.()}
      >
        <span className="json-viewer__label">{label}</span>
        <span className="json-viewer__punctuation">:</span>
        <span className={`json-viewer__value ${typeClass}`}>{JSON.stringify(value)}</span>
      </div>
    );
  }

  const isArray = Array.isArray(value);
  return (
    <div
      className={`json-viewer__item ${isExact ? "json-viewer__item--active" : ""}`}
      ref={ref}
      onMouseEnter={() => onHover?.(path)}
      onMouseLeave={() => onBlur?.()}
    >
      <div
        className="json-viewer__collapsible"
        onClick={(e) => {
          e.stopPropagation();
          setCollapsed(!collapsed);
        }}
      >
        <span
          className={`json-viewer__toggle ${collapsed ? "json-viewer__toggle--expand" : "json-viewer__toggle--collapse"}`}
        >
          {collapsed ? "+" : "-"}
        </span>
        <span className="json-viewer__label">{getItemLabel(label, value)}</span>
        <span className="json-viewer__punctuation">
          : {isArray ? "[" : "{"}
          {collapsed && (isArray ? " ... ]" : " ... }")}
        </span>
      </div>
      {!collapsed && (
        <>
          <div className="json-viewer__children">
            {Object.entries(value).map(([key, val]) => (
              <JsonItem
                key={key}
                label={getItemLabel(key, val)}
                value={val}
                path={[...path, key]}
                focusPath={focusPath}
                onHover={onHover}
                onBlur={onBlur}
              />
            ))}
          </div>
          <div className="json-viewer__punctuation json-viewer__punctuation--end">
            {isArray ? "]" : "}"}
          </div>
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
