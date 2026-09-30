const Colors = {
  // Yellow accent: fill-only (badges/toggles). White text on it is only
  // 2.1:1 and it barely stands out from the mint background — never use it
  // behind white label text; pair it with dark text instead.
  primary: "#bfb63b",
  // Darkened greens/reds so small text passes WCAG AA (4.5:1) on the mint
  // backgrounds: #2E7D32 was 4.2:1 and #D32F2F was 4.1:1 as body/error text.
  secondary: "#1B5E20",
  warning: "#B71C1C",

  light: {
    text: "#203124", // deep green-gray
    title: "#132015", // darker for headings
    iconColor: "#5E7161", // muted sage
    background: "#d0f2d1", // soft mint green
    iconColorFocused: "#2E7D32",
    uiBackground: "#E6F7E6", // slightly lighter than page background
    navBackground: "#F4FCF4", // almost white with green tint
    border: "#A9D6AE",
  },

  dark: {
    text: "#EEF6EE", // soft off-white
    title: "#FFFFFF",
    iconColor: "#C2D3C2", // light sage
    background: "#4A594A", // deep muted green
    iconColorFocused: "#7ED957",
    uiBackground: "#3E4C3E", // darker than background for cards
    navBackground: "#364236", // distinct navigation surface
    border: "#607060",
  },
};

export default Colors;
