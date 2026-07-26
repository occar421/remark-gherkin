import { JsonItem } from "./JsonItem.js";

type Props = {
  data: object | Node | object[];
  focusPath?: string[];
  onHover: (path: string[]) => void;
  onBlur: () => void;
};

export function JsonViewer({ data, focusPath, onHover, onBlur }: Props) {
  return (
    <div className="json-view-container">
      <JsonItem
        label="root"
        value={data}
        path={["root"]}
        focusPath={focusPath}
        onHover={onHover}
        onBlur={onBlur}
      />
    </div>
  );
}
