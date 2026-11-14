import { describe, expect, it } from "vitest";
import { appReducer, initialState, type AppAction, type AppState } from "./reducer";

const run = (actions: AppAction[], from: AppState = initialState) => actions.reduce(appReducer, from);

describe("range", () => {
  it("changes the shared time range", () => {
    expect(run([{ type: "setRange", range: "7D" }]).range).toBe("7D");
  });
});

describe("table sorting", () => {
  it("starts on page views, highest first", () => {
    expect(initialState.table).toMatchObject({ sortKey: "pageViews", sortDir: -1 });
  });

  it("flips direction when the active column is clicked again", () => {
    const once = run([{ type: "sortBy", key: "pageViews" }]);
    expect(once.table).toMatchObject({ sortKey: "pageViews", sortDir: 1 });
    expect(run([{ type: "sortBy", key: "pageViews" }], once).table.sortDir).toBe(-1);
  });

  it("starts a new numeric column high to low and the name column A to Z", () => {
    expect(run([{ type: "sortBy", key: "botShare" }]).table).toMatchObject({ sortKey: "botShare", sortDir: -1 });
    expect(run([{ type: "sortBy", key: "name" }]).table).toMatchObject({ sortKey: "name", sortDir: 1 });
  });

  it("keeps search and category when the sort changes", () => {
    const state = run([
      { type: "setQuery", query: "lu" },
      { type: "setCategory", category: "DeFi" },
      { type: "sortBy", key: "name" },
    ]);
    expect(state.table).toEqual({ sortKey: "name", sortDir: 1, query: "lu", category: "DeFi" });
  });
});

describe("comparison picks", () => {
  it("starts with three projects", () => {
    expect(initialState.picked).toEqual(["skyhitz", "nebula", "orbit"]);
  });

  it("removes a picked project", () => {
    expect(run([{ type: "togglePick", id: "nebula" }]).picked).toEqual(["skyhitz", "orbit"]);
  });

  it("ignores a fourth pick", () => {
    const state = run([{ type: "togglePick", id: "vault" }]);
    expect(state).toBe(initialState);
  });

  it("appends a new pick once there is room, keeping selection order", () => {
    const state = run([
      { type: "togglePick", id: "skyhitz" },
      { type: "togglePick", id: "vault" },
    ]);
    expect(state.picked).toEqual(["nebula", "orbit", "vault"]);
  });
});

describe("removing projects", () => {
  it("marks the project removed and takes it out of the comparison", () => {
    const state = run([{ type: "removeProject", id: "nebula" }]);
    expect(state.removed).toEqual(["nebula"]);
    expect(state.picked).toEqual(["skyhitz", "orbit"]);
  });

  it("frees the comparison slot for another project", () => {
    const state = run([
      { type: "removeProject", id: "nebula" },
      { type: "togglePick", id: "vault" },
    ]);
    expect(state.picked).toEqual(["skyhitz", "orbit", "vault"]);
  });

  it("does nothing when the project is already removed", () => {
    const once = run([{ type: "removeProject", id: "nebula" }]);
    expect(run([{ type: "removeProject", id: "nebula" }], once)).toBe(once);
  });

  it("restores a project without re-adding it to the comparison", () => {
    const state = run([
      { type: "removeProject", id: "nebula" },
      { type: "restoreProject", id: "nebula" },
    ]);
    expect(state.removed).toEqual([]);
    expect(state.picked).toEqual(["skyhitz", "orbit"]);
  });
});

describe("enrollment mode", () => {
  it("switches between self-service and approval", () => {
    expect(run([{ type: "setEnrollmentMode", mode: "approval" }]).enrollmentMode).toBe("approval");
  });
});

describe("API keys", () => {
  it("puts a new key first, active, showing only its prefix", () => {
    const state = run([{ type: "addApiKey", prefix: "ses_live_ab12", createdOn: "2026-11-13" }]);
    expect(state.apiKeys).toHaveLength(4);
    expect(state.apiKeys[0]).toEqual({
      id: "key-4",
      prefix: "ses_live_ab12",
      meta: "New key · created 2026-11-13",
      active: true,
    });
  });

  it("gives every key its own id", () => {
    const state = run([
      { type: "addApiKey", prefix: "ses_live_aaaa", createdOn: "2026-11-13" },
      { type: "addApiKey", prefix: "ses_live_bbbb", createdOn: "2026-11-13" },
    ]);
    expect(new Set(state.apiKeys.map((key) => key.id)).size).toBe(5);
  });

  it("revokes one key and leaves the others alone", () => {
    const state = run([{ type: "revokeApiKey", id: "key-1" }]);
    expect(state.apiKeys.map((key) => key.active)).toEqual([false, true, false]);
  });
});

describe("setup tab", () => {
  it("remembers the chosen platform", () => {
    expect(run([{ type: "setSetupTab", tab: "otel" }]).setupTab).toBe("otel");
  });
});

describe("erasure requests", () => {
  it("queues a request at the top with the next id", () => {
    const state = run([{ type: "submitErasure", scope: "Date range", target: " 2026-11-01 to 2026-11-05 " }]);
    expect(state.erasures).toHaveLength(2);
    expect(state.erasures[0]).toEqual({
      id: "ER-0013",
      scope: "Date range",
      target: "2026-11-01 to 2026-11-05",
      status: "Queued",
    });
  });

  it("targets the tenant's site when no target is given", () => {
    const state = run([{ type: "submitErasure", scope: "All data for this site", target: "" }]);
    expect(state.erasures[0].target).toBe("skyhitz.io");
  });

  it("numbers requests in sequence", () => {
    const state = run([
      { type: "submitErasure", scope: "Date range", target: "a" },
      { type: "submitErasure", scope: "Date range", target: "b" },
    ]);
    expect(state.erasures.map((request) => request.id)).toEqual(["ER-0014", "ER-0013", "ER-0012"]);
  });
});

describe("enrollment wizard", () => {
  it("merges form edits", () => {
    const state = run([
      { type: "updateEnrollmentForm", patch: { name: "My App" } },
      { type: "updateEnrollmentForm", patch: { api: true } },
    ]);
    expect(state.enrollment.form).toEqual({ name: "My App", domain: "", email: "", web: true, api: true });
  });

  it("moves between steps and records verification", () => {
    const state = run([{ type: "setEnrollmentStep", step: 3 }, { type: "markEnrollmentVerified" }]);
    expect(state.enrollment).toMatchObject({ step: 3, verified: true });
  });

  it("restarts at the first step but keeps what was typed", () => {
    const state = run([
      { type: "updateEnrollmentForm", patch: { name: "My App" } },
      { type: "setEnrollmentStep", step: 3 },
      { type: "markEnrollmentVerified" },
      { type: "restartEnrollment" },
    ]);
    expect(state.enrollment).toMatchObject({ step: 1, verified: false });
    expect(state.enrollment.form.name).toBe("My App");
  });
});

describe("appReducer", () => {
  it("never mutates the previous state", () => {
    const frozen = structuredClone(initialState);
    run([
      { type: "togglePick", id: "nebula" },
      { type: "removeProject", id: "orbit" },
      { type: "addApiKey", prefix: "ses_live_ab12", createdOn: "2026-11-13" },
      { type: "submitErasure", scope: "Date range", target: "x" },
      { type: "updateEnrollmentForm", patch: { name: "x" } },
      { type: "sortBy", key: "name" },
    ]);
    expect(initialState).toEqual(frozen);
  });
});
