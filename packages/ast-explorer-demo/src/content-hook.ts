import { useCallback, useState } from "react";

const contentStorageKey = "ast-explorer-demo-content";

function getStoredContent(defaultContent: string) {
  try {
    return window.localStorage.getItem(contentStorageKey) ?? defaultContent;
  } catch {
    return defaultContent;
  }
}

export const useContent = (defaultContent: string) => {
  const [content, setContent] = useState(getStoredContent(defaultContent));

  const handleSetContent = useCallback((newContent: string) => {
    setContent(newContent);

    try {
      window.localStorage.setItem(contentStorageKey, content);
    } catch {
      // LocalStorage may be unavailable in private browsing or restricted environments.
    }
  }, []);

  return { content, setContent: handleSetContent };
};
