import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext";

let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("dark-only theme", () => {
  it("overrides a previously saved light preference with dark mode", () => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.setItem("mf-theme-mode", "light");
    let mode: string | undefined;
    function Probe() {
      mode = useTheme().mode;
      return null;
    }
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root?.render(<ThemeProvider><Probe /></ThemeProvider>));
    expect(mode).toBe("dark");
    expect(localStorage.getItem("mf-theme-mode")).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
