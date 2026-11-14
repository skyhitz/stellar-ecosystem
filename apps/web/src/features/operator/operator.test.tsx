import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { EcosystemPulse } from "@/features/landing/EcosystemPulse";
import { renderWithState } from "@/test/render";
import { AdminScreen } from "./AdminScreen";
import { CompareScreen } from "./CompareScreen";
import { GlobalScreen } from "./GlobalScreen";

/** Project names in the order the table shows them. */
function tableOrder(): string[] {
  const table = screen.getByRole("table", { name: "Enrolled projects" });
  return within(table)
    .getAllByRole("checkbox")
    .map((box) => box.getAttribute("aria-label")!.replace("Compare ", ""));
}

describe("GlobalScreen", () => {
  it("lists every project by page views", () => {
    renderWithState(<GlobalScreen />);
    expect(tableOrder()).toEqual([
      "Nebula DEX",
      "Skyhitz",
      "StarVault",
      "Orbit Pay",
      "Lumen Lend",
      "Anchorly",
      "Comet SDK Docs",
      "Quasar ID",
    ]);
    expect(screen.getByRole("columnheader", { name: /Views/ })).toHaveAttribute("aria-sort", "descending");
  });

  it("sorts by a column and flips on the second click", async () => {
    const user = userEvent.setup();
    renderWithState(<GlobalScreen />);

    await user.click(screen.getByRole("button", { name: /^Bot %/ }));
    expect(tableOrder()[0]).toBe("StarVault");

    await user.click(screen.getByRole("button", { name: /^Bot %/ }));
    expect(tableOrder()[0]).toBe("Anchorly");
    expect(screen.getByRole("columnheader", { name: /Bot %/ })).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getByRole("columnheader", { name: /Views/ })).not.toHaveAttribute("aria-sort");
  });

  it("filters by category and by search", async () => {
    const user = userEvent.setup();
    renderWithState(<GlobalScreen />);

    await user.click(screen.getByRole("button", { name: "DeFi" }));
    expect(tableOrder()).toEqual(["Nebula DEX", "Lumen Lend"]);

    await user.type(screen.getByRole("textbox", { name: "Search projects" }), "lu");
    expect(tableOrder()).toEqual(["Lumen Lend"]);

    await user.type(screen.getByRole("textbox", { name: "Search projects" }), "zzz");
    expect(screen.getByText("No projects match.")).toBeInTheDocument();
  });

  it("rescales volumes when the range changes", async () => {
    const user = userEvent.setup();
    renderWithState(<GlobalScreen />);
    expect(screen.getByText("2.04M")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "12M" }));

    expect(screen.getByText("24.52M")).toBeInTheDocument();
    expect(screen.getByText("337.44M")).toBeInTheDocument();
  });

  it("allows at most three projects in the comparison", async () => {
    const user = userEvent.setup();
    renderWithState(<GlobalScreen />);
    const starVault = screen.getByRole("checkbox", { name: "Compare StarVault" });

    await user.click(starVault);
    expect(starVault).not.toBeChecked();
    expect(screen.getByRole("link", { name: "Compare (3) →" })).toHaveAttribute("href", "/operator/compare");

    await user.click(screen.getByRole("checkbox", { name: "Compare Skyhitz" }));
    expect(screen.getByRole("link", { name: "Compare (2) →" })).toBeInTheDocument();

    await user.click(starVault);
    expect(starVault).toBeChecked();
  });
});

describe("CompareScreen", () => {
  it("draws one line per selected project", async () => {
    const user = userEvent.setup();
    renderWithState(<CompareScreen />);
    const chart = screen.getByRole("img", { name: /Page views over time for Skyhitz, Nebula DEX, Orbit Pay/ });
    expect(chart.querySelectorAll("path")).toHaveLength(3);

    await user.click(screen.getByRole("button", { name: /Orbit Pay/ }));

    expect(screen.getByRole("img", { name: /Skyhitz, Nebula DEX$/ }).querySelectorAll("path")).toHaveLength(2);
    expect(screen.getByRole("button", { name: /Orbit Pay/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("shows six metrics for the selected projects", () => {
    renderWithState(<CompareScreen />);
    for (const label of ["Unique visitors", "Bounce rate", "Session duration", "API requests", "Latency p95"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("688.0K")).toBeInTheDocument();
  });
});

describe("AdminScreen", () => {
  it("asks before removing a project", async () => {
    const user = userEvent.setup();
    renderWithState(<AdminScreen />);

    await user.click(screen.getByRole("button", { name: "Remove Nebula DEX" }));
    expect(screen.getByRole("button", { name: "Confirm removal of Nebula DEX" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Remove Nebula DEX" })).toBeInTheDocument();
    expect(screen.queryByText("Removed · ingestion stopped")).not.toBeInTheDocument();
  });

  it("removes a project everywhere and can restore it", async () => {
    const user = userEvent.setup();
    renderWithState(
      <>
        <AdminScreen />
        <GlobalScreen />
        <EcosystemPulse />
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Remove Nebula DEX" }));
    await user.click(screen.getByRole("button", { name: "Confirm removal of Nebula DEX" }));

    expect(screen.getByText("Removed · ingestion stopped")).toBeInTheDocument();
    expect(tableOrder()).not.toContain("Nebula DEX");
    expect(tableOrder()).toHaveLength(7);
    expect(screen.getByRole("link", { name: "Compare (2) →" })).toBeInTheDocument();
    // The landing constellation labels each live project.
    expect(screen.queryByText("NEBULA DEX")).not.toBeInTheDocument();
    expect(screen.getByText("SKYHITZ")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Restore Nebula DEX" }));
    expect(tableOrder()).toContain("Nebula DEX");
    expect(screen.getByText("NEBULA DEX")).toBeInTheDocument();
  });

  it("flags a project with a high bot share", () => {
    renderWithState(<AdminScreen />);
    expect(screen.getByText("Active · flagged: high bot share")).toBeInTheDocument();
  });

  it("explains the enrollment model that is selected", async () => {
    const user = userEvent.setup();
    renderWithState(<AdminScreen />);
    expect(screen.getByText("Any project can enroll and start sending data immediately.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Approval required" }));

    expect(screen.getByText("New projects wait for operator approval before ingestion starts.")).toBeInTheDocument();
  });

  it("shows a generated key once and lists it by prefix", async () => {
    const user = userEvent.setup();
    renderWithState(<AdminScreen />);

    await user.click(screen.getByRole("button", { name: "Generate key" }));

    const reveal = screen.getByRole("status");
    const key = within(reveal).getByText(/^ses_live_[0-9a-z]{22}$/).textContent!;
    expect(within(reveal).getByText("Copy this key now. It will not be shown again.")).toBeInTheDocument();
    expect(screen.getByText(`${key.slice(0, 13)}…`)).toBeInTheDocument();
    expect(screen.getByText(/^New key · created \d{4}-\d{2}-\d{2}$/)).toBeInTheDocument();
  });

  it("revokes a key", async () => {
    const user = userEvent.setup();
    renderWithState(<AdminScreen />);
    expect(screen.getAllByText("Revoked")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Revoke key ses_live_7Qk2" }));

    expect(screen.getAllByText("Revoked")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Revoke key ses_live_7Qk2" })).not.toBeInTheDocument();
  });
});
