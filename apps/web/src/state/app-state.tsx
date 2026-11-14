"use client";

import { createContext, use, useReducer, type Dispatch, type ReactNode } from "react";
import { appReducer, initialState, type AppAction, type AppState } from "./reducer";

const StateContext = createContext<AppState | null>(null);
const DispatchContext = createContext<Dispatch<AppAction> | null>(null);

/**
 * Holds the state that screens share. It lives in the root layout, so it
 * survives navigation and resets on a full page load.
 */
export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <DispatchContext value={dispatch}>
      <StateContext value={state}>{children}</StateContext>
    </DispatchContext>
  );
}

export function useAppState(): AppState {
  const state = use(StateContext);
  if (!state) throw new Error("useAppState must be used inside <AppStateProvider>");
  return state;
}

export function useAppDispatch(): Dispatch<AppAction> {
  const dispatch = use(DispatchContext);
  if (!dispatch) throw new Error("useAppDispatch must be used inside <AppStateProvider>");
  return dispatch;
}
