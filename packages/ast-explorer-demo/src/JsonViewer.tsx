import { JsonItem } from "./JsonItem.js";

export function JsonViewer({ data, activePath, onHover }: any) {
  return (
    <div className="json-view-container">
      <JsonItem
        label="root"
        value={data}
        path={["root"]}
        activePath={activePath}
        onHover={onHover}
      />
    </div>
  );
}
