import { useCallback, useState } from "react";

export function useTreeConfig() {
  const [hideLocation, setHideLocation] = useState(true);
  const [hideMethods, setHideMethods] = useState(true);
  const [hideEmpty, setHideEmpty] = useState(true);
  const [hideType, setHideType] = useState(false);
  const [autofocus, setAutofocus] = useState(true);

  const controls = [
    ["Autofocus", autofocus, setAutofocus],
    ["Hide methods", hideMethods, setHideMethods],
    ["Hide empty keys", hideEmpty, setHideEmpty],
    ["Hide location data", hideLocation, setHideLocation],
    ["Hide type keys", hideType, setHideType],
  ] as const;

  const render = useCallback(() => {
    return (
      <div className="header-bottom">
        {controls.map(([label, checked, setter]) => (
          <label className="checkbox-label" key={label}>
            <input type="checkbox" checked={checked} onChange={(e) => setter(e.target.checked)} />
            {label}
          </label>
        ))}
      </div>
    );
  }, [controls]);

  return {
    hideLocation,
    hideMethods,
    hideEmpty,
    hideType,
    autofocus,
    render,
  };
}
