import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkGherkin from "remark-gherkin";
import type { Node, Position } from "unist";

export const processor = unified().use(remarkParse).use(remarkGfm).use(remarkGherkin);

type Options = {
  hideLocation: boolean;
  hideMethods: boolean;
  hideEmpty: boolean;
  hideType: boolean;
};

export function filterNode(node: Node, options: Options): Node {
  return filterNodeInner(node as unknown as RecursiveNodeInner, options) as unknown as Node;
}

type RecursiveNodeInner = { [key: string]: RecursiveNodeInner } | RecursiveNodeInner[];

function filterNodeInner(node: RecursiveNodeInner, options: Options): RecursiveNodeInner {
  if (Array.isArray(node)) {
    const filtered = node.map((n) => filterNodeInner(n, options));
    return options.hideEmpty
      ? filtered.filter((item) => {
          if (item === null || item === undefined) return false;
          if (Array.isArray(item)) return item.length > 0;
          if (typeof item === "object") return Object.keys(item).length > 0;
          return true;
        })
      : filtered;
  }

  if (!(node && typeof node === "object")) {
    return node;
  }

  const result: Record<string, {}> = {};
  for (const key in node) {
    if (options.hideLocation && key === "position") continue;
    if (options.hideType && key === "type") continue;

    const value = node[key];
    if (!value) continue;
    if (options.hideMethods && typeof value === "function") continue;

    const filteredValue = filterNodeInner(value, options);

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

export function findPathAt(
  node: object | Node | object[],
  line: number,
  column: number,
  currentPath: string[] = [],
): string[] | null {
  if (!node || typeof node !== "object") return null;

  if ("position" in node && node.position) {
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
      const p = findPathAt(node[key as keyof typeof node], line, column, [...currentPath, key]);
      if (p) return p;
    }
  }

  if ("position" in node && node.position) {
    return currentPath;
  }

  return null;
}

export function getNodeAtPath(node: Node, path: string[]): Node | null {
  let current = node;
  for (const part of path) {
    if (current === null || current === undefined) return null;
    current = current[part as keyof typeof current] as unknown as Node;
  }
  return current;
}

export function getPositionAtPath(node: Node, path: string[]): Position | null {
  for (let length = path.length; length >= 0; length--) {
    const candidate = getNodeAtPath(node, path.slice(0, length));
    if (candidate?.position) return candidate.position;
  }
  return null;
}
