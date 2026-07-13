import { useEffect, useRef, useState } from "react";

export function JsonItem({ label, value, path, activePath, onHover }: any) {
  const [collapsed, setCollapsed] = useState(false);
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
    if (isParent && collapsed) setCollapsed(false);
  }, [isParent, collapsed]);

  if (!isObject) {
    let typeClass = "json-view-number";
    if (typeof value === "string") typeClass = "json-view-string";
    if (typeof value === "boolean") typeClass = "json-view-boolean";
    if (value === null) typeClass = "json-view-null";
    return (
      <div
        className={`json-view-item ${isExact ? "json-view-active" : ""}`}
        ref={ref}
        onMouseEnter={() => onHover(path)}
        onMouseLeave={() => onHover(null)}
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
      onMouseEnter={() => onHover(path)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        className="json-view-collapsible"
        onClick={(e) => {
          e.stopPropagation();
          setCollapsed(!collapsed);
        }}
      >
        <span className="json-view-toggle">{collapsed ? "▶" : "▼"}</span>
        <span className="json-view-label">{label}</span>
        <span className="json-view-punctuation">
          : {isArray ? "[" : "{"}
          {collapsed && (isArray ? " ... ]" : " ... }")}
        </span>
      </div>
      {!collapsed && (
        <>
          <div className="json-view-children">
            {Object.keys(value).map((key) => (
              <JsonItem
                key={key}
                label={key}
                value={value[key]}
                path={[...path, key]}
                activePath={activePath}
                onHover={onHover}
              />
            ))}
          </div>
          <div className="json-view-punctuation" style={{ marginLeft: "7px" }}>
            {isArray ? "]" : "}"}
          </div>
        </>
      )}
    </div>
  );
}
