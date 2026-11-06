// Rows move between lists and forms close, so the element that had the focus is often gone: the
// next one is found by its data-focus mark once React has painted.
export const focusMark = (name: string) => ({ 'data-focus': name });

export const focusLater = (name: string) => {
  requestAnimationFrame(() => {
    document
      .querySelector<HTMLElement>(`[data-focus="${CSS.escape(name)}"]`)
      ?.focus();
  });
};
