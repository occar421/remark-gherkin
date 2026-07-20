import { JsonItem } from "./JsonItem.js";

type Props = {
  data: object | Node | object[];
  activePath: string[] | null;
  onHover: (path: string[]) => void;
  onBlur: () => void;
};

export function JsonViewer({ data, activePath, onHover, onBlur }: Props) {
  return (
    <div className="json-view-container">
      <JsonItem
        label="root"
        value={data}
        path={["root"]}
        activePath={activePath}
        onHover={onHover}
        onBlur={onBlur}
      />
    </div>
  );
}
