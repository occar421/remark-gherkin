import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";

export const processor = unified().use(remarkParse).use(remarkGherkin);

export function filterNode(
  node: any,
  options: {
    hideLocation: boolean;
    hideMethods: boolean;
    hideEmpty: boolean;
    hideType: boolean;
  },
): any {
  if (Array.isArray(node)) {
    const filtered = node.map((n) => filterNode(n, options));
    return options.hideEmpty
      ? filtered.filter((item) => {
          if (item === null || item === undefined) return false;
          if (Array.isArray(item)) return item.length > 0;
          if (typeof item === "object") return Object.keys(item).length > 0;
          return true;
        })
      : filtered;
  }

  if (node && typeof node === "object") {
    const result: any = {};
    for (const key in node) {
      if (options.hideLocation && key === "position") continue;
      if (options.hideType && key === "type") continue;

      const value = node[key];
      if (options.hideMethods && typeof value === "function") continue;

      const filteredValue = filterNode(value, options);

      if (options.hideEmpty) {
        if (filteredValue === null || filteredValue === undefined) continue;
        if (Array.isArray(filteredValue) && filteredValue.length === 0) continue;
        if (
          typeof filteredValue === "object" &&
          Object.keys(filteredValue).length === 0 &&
          !(filteredValue instanceof Date)
        )
          continue;
      }

      result[key] = filteredValue;
    }
    return result;
  }
  return node;
}

export function findPathAt(
  node: any,
  line: number,
  column: number,
  currentPath: string[] = [],
): string[] | null {
  if (!node || typeof node !== "object") return null;

  if (node.position) {
    const { start, end } = node.position;
    if (
      line < start.line ||
      line > end.line ||
      (line === start.line && column < start.column) ||
      (line === end.line && column > end.column)
    ) {
      return null;
    }
  }

  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const p = findPathAt(node[i], line, column, [...currentPath, String(i)]);
      if (p) return p;
    }
  } else {
    for (const key in node) {
      if (key === "position") continue;
      const p = findPathAt(node[key], line, column, [...currentPath, key]);
      if (p) return p;
    }
  }

  return node.position ? currentPath : null;
}

export function getNodeAtPath(node: any, path: string[]): any {
  let current = node;
  for (const part of path) {
    if (current === null || current === undefined) return null;
    current = current[part];
  }
  return current;
}

export function getPositionAtPath(node: any, path: string[]): any {
  for (let length = path.length; length >= 0; length--) {
    const candidate = getNodeAtPath(node, path.slice(0, length));
    if (candidate?.position) return candidate.position;
  }
  return null;
}
