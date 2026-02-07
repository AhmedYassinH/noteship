export const SHELL_BREAKPOINTS = {
  mobileMax: 767,
  tabletMax: 1023,
  wideMin: 1440,
} as const;

export const SIDEBAR_STORAGE_KEYS = {
  collapsed: "noteship-sidebar-collapsed",
  width: "noteship-sidebar-width",
} as const;

export const SIDEBAR_COLLAPSED_WIDTH = 80;
export const SIDEBAR_MIN_WIDTH = 240;
export const SIDEBAR_MAX_WIDTH_DESKTOP = 320;
export const SIDEBAR_MAX_WIDTH_WIDE = 360;

export const SIDEBAR_DEFAULT_WIDTH = {
  tablet: 256,
  desktop: 272,
  wide: 288,
} as const;

export const SIDEBAR_SNAP_POINTS = [240, 272, 304, 336, 360] as const;
