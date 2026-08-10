import { useState } from "react";
import "./TreeConfig.css";

export function TreeConfig() {
  const settings = TreeConfig.useSettings();
  const controls = [
    ["Autofocus", settings.autofocus, settings.setAutofocus],
    ["Hide methods", settings.hideMethods, settings.setHideMethods],
    ["Hide empty keys", settings.hideEmpty, settings.setHideEmpty],
    ["Hide location data", settings.hideLocation, settings.setHideLocation],
    ["Hide type keys", settings.hideType, settings.setHideType],
  ] as const;
  return (
    <div className="tree-config">
      <div className="tree-config__options">
        {controls.map(([label, checked, setter]) => (
          <label className="tree-config__option" key={label}>
            <input type="checkbox" checked={checked} onChange={(e) => setter(e.target.checked)} />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
TreeConfig.useSettings = function useSettings() {
  const [hideLocation, setHideLocation] = useState(true);
  const [hideMethods, setHideMethods] = useState(true);
  const [hideEmpty, setHideEmpty] = useState(true);
  const [hideType, setHideType] = useState(false);
  const [autofocus, setAutofocus] = useState(true);
  return {
    hideLocation,
    setHideLocation,
    hideMethods,
    setHideMethods,
    hideEmpty,
    setHideEmpty,
    hideType,
    setHideType,
    autofocus,
    setAutofocus,
  };
};
