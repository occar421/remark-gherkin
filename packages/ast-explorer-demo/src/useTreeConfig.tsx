import { useCallback, useState } from "react";

export function useTreeConfig() {
  const [hideLocation, setHideLocation] = useState(true);
  const [hideMethods, setHideMethods] = useState(true);
  const [hideEmpty, setHideEmpty] = useState(true);
  const [hideType, setHideType] = useState(false);
  const [autofocus, setAutofocus] = useState(true);

  const render = useCallback(
    () => (
      <div className="header-bottom">
        {[
          ["Autofocus", autofocus, setAutofocus],
          ["Hide methods", hideMethods, setHideMethods],
          ["Hide empty keys", hideEmpty, setHideEmpty],
          ["Hide location data", hideLocation, setHideLocation],
          ["Hide type keys", hideType, setHideType],
        ].map(([label, checked, setter]: any) => (
          <label className="checkbox-label" key={label as string}>
            <input
              type="checkbox"
              checked={checked as boolean}
              onChange={(e) => setter(e.target.checked)}
            />
            {label as string}
          </label>
        ))}
      </div>
    ),
    [autofocus, hideMethods, hideEmpty, hideLocation, hideType],
  );

  return {
    hideLocation,
    hideMethods,
    hideEmpty,
    hideType,
    autofocus,
    render,
  };
}
