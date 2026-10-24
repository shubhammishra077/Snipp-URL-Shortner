import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "dark";
  }
};

const initialTheme = getInitialTheme();

const applyThemeClass = (theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
};

applyThemeClass(initialTheme);

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: initialTheme },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
      try { localStorage.setItem("theme", state.mode); } catch { /* storage unavailable, ignore */ }
      applyThemeClass(state.mode);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      try { localStorage.setItem("theme", state.mode); } catch { /* storage unavailable, ignore */ }
      applyThemeClass(state.mode);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
