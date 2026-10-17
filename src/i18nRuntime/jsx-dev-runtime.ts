import { Fragment, jsxDEV as reactJsxDEV } from "react/jsx-dev-runtime";
import { currentInterfaceLanguage, translateUi } from "../i18n";

function translateText(source: string) {
  const leading = source.match(/^\s*/)?.[0] ?? "";
  const trailing = source.match(/\s*$/)?.[0] ?? "";
  const core = source.trim();
  if (!core) return source;
  return leading + translateUi(core, currentInterfaceLanguage()) + trailing;
}

function translateChild(child: unknown): unknown {
  if (typeof child === "string") return translateText(child);
  if (Array.isArray(child)) return child.map(translateChild);
  return child;
}

function translatedProps(type: unknown, props: unknown) {
  if (!props || typeof props !== "object") return props;
  const isIntrinsic = typeof type === "string";
  const isFragment = type === Fragment;
  if (!isIntrinsic && !isFragment) return props;

  const source = props as Record<string, unknown>;
  let changed = false;
  const next: Record<string, unknown> = { ...source };

  if ("children" in source) {
    const translated = translateChild(source.children);
    if (translated !== source.children) {
      next.children = translated;
      changed = true;
    }
  }

  if (isIntrinsic) {
    for (const attribute of ["placeholder", "title", "aria-label"] as const) {
      const value = source[attribute];
      if (typeof value === "string") {
        const translated = translateText(value);
        if (translated !== value) {
          next[attribute] = translated;
          changed = true;
        }
      }
    }
  }

  return changed ? next : props;
}

export const jsxDEV = ((
  type: unknown,
  props: unknown,
  key: unknown,
  isStaticChildren: boolean,
  source: unknown,
  self: unknown,
) => reactJsxDEV(
  type as never,
  translatedProps(type, props) as never,
  key as never,
  isStaticChildren,
  source as never,
  self as never,
)) as typeof reactJsxDEV;

export { Fragment };
