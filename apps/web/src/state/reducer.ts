import { MAX_COMPARED, type CategoryFilter, type SortDirection, type SortKey } from "@/data/ecosystem";
import type { EnrollmentForm } from "@/data/enrollment";
import type { ErasureRequest, ErasureScope } from "@/data/privacy";
import { TENANT_DOMAIN } from "@/data/projects";
import { DEFAULT_RANGE } from "@/data/ranges";
import type { SetupTabId } from "@/data/setup";
import type { RangeKey } from "@/data/types";

export type EnrollmentMode = "self" | "approval";
export type EnrollmentStep = 1 | 2 | 3;

export interface ApiKey {
  id: string;
  /** The only part of a key that stays visible after it is created. */
  prefix: string;
  meta: string;
  active: boolean;
}

/**
 * State shared across screens for the length of a visit.
 *
 * `removed`, `enrollmentMode`, `apiKeys` and `erasures` stand in for records a
 * backend will own; the rest is view state that several screens read.
 */
export interface AppState {
  range: RangeKey;
  table: { sortKey: SortKey; sortDir: SortDirection; query: string; category: CategoryFilter };
  /** Ids of the projects selected for comparison, in selection order. */
  picked: string[];
  /** Ids of projects an operator has removed. */
  removed: string[];
  enrollmentMode: EnrollmentMode;
  apiKeys: ApiKey[];
  setupTab: SetupTabId;
  erasures: ErasureRequest[];
  enrollment: { step: EnrollmentStep; form: EnrollmentForm; verified: boolean };
}

export type AppAction =
  | { type: "setRange"; range: RangeKey }
  | { type: "sortBy"; key: SortKey }
  | { type: "setQuery"; query: string }
  | { type: "setCategory"; category: CategoryFilter }
  | { type: "togglePick"; id: string }
  | { type: "removeProject"; id: string }
  | { type: "restoreProject"; id: string }
  | { type: "setEnrollmentMode"; mode: EnrollmentMode }
  | { type: "addApiKey"; prefix: string; createdOn: string }
  | { type: "revokeApiKey"; id: string }
  | { type: "setSetupTab"; tab: SetupTabId }
  | { type: "submitErasure"; scope: ErasureScope; target: string }
  | { type: "updateEnrollmentForm"; patch: Partial<EnrollmentForm> }
  | { type: "setEnrollmentStep"; step: EnrollmentStep }
  | { type: "markEnrollmentVerified" }
  | { type: "restartEnrollment" };

export const initialState: AppState = {
  range: DEFAULT_RANGE,
  table: { sortKey: "pageViews", sortDir: -1, query: "", category: "All" },
  picked: ["skyhitz", "nebula", "orbit"],
  removed: [],
  enrollmentMode: "self",
  apiKeys: [
    { id: "key-1", prefix: "ses_live_7Qk2", meta: "SCF traction review · created 2026-09-02", active: true },
    { id: "key-2", prefix: "ses_live_c9Xp", meta: "Ecosystem dashboard · created 2026-07-18", active: true },
    { id: "key-3", prefix: "ses_live_Lm04", meta: "Test integration · created 2026-05-30", active: false },
  ],
  setupTab: "html",
  erasures: [{ id: "ER-0012", scope: "Date range", target: "2026-08-01 to 2026-08-03", status: "Completed" }],
  enrollment: {
    step: 1,
    form: { name: "", domain: "", email: "", web: true, api: false },
    verified: false,
  },
};

/** Erasure ids continue the sequence of the seeded request, ER-0012. */
const FIRST_ERASURE_NUMBER = 12;

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "setRange":
      return { ...state, range: action.range };

    case "sortBy": {
      const { sortKey, sortDir } = state.table;
      // Clicking the active column flips it; a new column starts A→Z for names, high→low for numbers.
      const nextDir: SortDirection =
        sortKey === action.key ? (sortDir === 1 ? -1 : 1) : action.key === "name" ? 1 : -1;
      return { ...state, table: { ...state.table, sortKey: action.key, sortDir: nextDir } };
    }

    case "setQuery":
      return { ...state, table: { ...state.table, query: action.query } };

    case "setCategory":
      return { ...state, table: { ...state.table, category: action.category } };

    case "togglePick": {
      if (state.picked.includes(action.id)) {
        return { ...state, picked: state.picked.filter((id) => id !== action.id) };
      }
      if (state.picked.length >= MAX_COMPARED) return state;
      return { ...state, picked: [...state.picked, action.id] };
    }

    case "removeProject":
      if (state.removed.includes(action.id)) return state;
      return {
        ...state,
        removed: [...state.removed, action.id],
        // A removed project also leaves the comparison, freeing its slot.
        picked: state.picked.filter((id) => id !== action.id),
      };

    case "restoreProject":
      return { ...state, removed: state.removed.filter((id) => id !== action.id) };

    case "setEnrollmentMode":
      return { ...state, enrollmentMode: action.mode };

    case "addApiKey": {
      const key: ApiKey = {
        id: `key-${state.apiKeys.length + 1}`,
        prefix: action.prefix,
        meta: `New key · created ${action.createdOn}`,
        active: true,
      };
      return { ...state, apiKeys: [key, ...state.apiKeys] };
    }

    case "revokeApiKey":
      return {
        ...state,
        apiKeys: state.apiKeys.map((key) => (key.id === action.id ? { ...key, active: false } : key)),
      };

    case "setSetupTab":
      return { ...state, setupTab: action.tab };

    case "submitErasure": {
      const number = FIRST_ERASURE_NUMBER + state.erasures.length;
      const request: ErasureRequest = {
        id: `ER-${String(number).padStart(4, "0")}`,
        scope: action.scope,
        target: action.target.trim() || TENANT_DOMAIN,
        status: "Queued",
      };
      return { ...state, erasures: [request, ...state.erasures] };
    }

    case "updateEnrollmentForm":
      return {
        ...state,
        enrollment: { ...state.enrollment, form: { ...state.enrollment.form, ...action.patch } },
      };

    case "setEnrollmentStep":
      return { ...state, enrollment: { ...state.enrollment, step: action.step } };

    case "markEnrollmentVerified":
      return { ...state, enrollment: { ...state.enrollment, verified: true } };

    case "restartEnrollment":
      // Starts the wizard over but keeps what was already typed.
      return { ...state, enrollment: { ...state.enrollment, step: 1, verified: false } };
  }
}
