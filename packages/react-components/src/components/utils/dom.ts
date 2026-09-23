export const createDomElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string
): HTMLElementTagNameMap[K] => {
  if (typeof document === 'undefined') {
    throw new Error(
      `[Shared-Components][Dom]: cannot create "<${tagName}>" — no DOM "document" is available in this environment.`
    );
  }
  if (typeof document.createElement !== 'function') {
    throw new Error(
      `[Shared-Components][Dom]: cannot create "<${tagName}>" — "document.createElement" is not supported in this environment.`
    );
  }

  let element: HTMLElementTagNameMap[K];
  try {
    element = document.createElement(tagName);
  } catch (err) {
    throw new Error(`[Shared-Components][Dom]: "document.createElement('${tagName}')" failed: ${String(err)}`);
  }

  if (className) {
    element.className = className;
  }
  return element;
};
