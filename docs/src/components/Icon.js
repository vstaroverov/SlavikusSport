export function icon(name) {
  const icons = {
    play: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
    plus: `<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`,
    list: `<svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>`,
    stats: `<svg viewBox="0 0 24 24"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>`,
    home: `<svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>`,
    dumbbell: `<svg viewBox="0 0 24 24"><path d="M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12"/></svg>`,
    clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24"><path d="M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1z"/></svg>`,
    note: `<svg viewBox="0 0 24 24"><path d="M7 3h8l4 4v14H7z"/><path d="M15 3v5h5M10 13h6M10 17h6"/></svg>`,
    crown: `<svg viewBox="0 0 24 24"><path d="m4 18 1.4-9 4.6 4 2-6 2 6 4.6-4L20 18z"/><path d="M5 21h14"/></svg>`
  };

  return icons[name] || "";
}
