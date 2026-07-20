export function dispatchAppChangedKeepingScroll(anchor) {
  const shell = anchor?.closest?.(".phone-shell");
  const scrollTop = shell?.scrollTop ?? 0;

  window.dispatchEvent(new CustomEvent("app:changed"));

  requestAnimationFrame(() => {
    const nextShell = document.querySelector(".phone-shell");
    if (nextShell) nextShell.scrollTop = scrollTop;
  });
}
