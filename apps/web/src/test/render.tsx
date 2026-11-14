import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { AppStateProvider } from "@/state/app-state";

/** Renders screens inside the shared state provider, as the root layout does. */
export function renderWithState(ui: ReactElement): RenderResult {
  return render(<AppStateProvider>{ui}</AppStateProvider>);
}
