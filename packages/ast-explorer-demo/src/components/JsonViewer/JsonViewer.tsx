import { JsonItem } from "./JsonItem.js";
import "./JsonViewer.css";

type Props = {
  data: object | object[];
  focusPath?: string[];
  onHover: (path: string[]) => void;
  onBlur: () => void;
};

export function JsonViewer({ data, focusPath, onHover, onBlur }: Props) {
  return (
    <div className="json-viewer">
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
