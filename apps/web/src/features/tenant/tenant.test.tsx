import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithState } from "@/test/render";
import { ApiAnalyticsScreen } from "./ApiAnalyticsScreen";
import { PrivacyScreen } from "./PrivacyScreen";
import { SetupScreen } from "./SetupScreen";
import { WebAnalyticsScreen } from "./WebAnalyticsScreen";

describe("WebAnalyticsScreen", () => {
  it("shows the tenant's figures for the selected range", async () => {
    const user = userEvent.setup();
    renderWithState(<WebAnalyticsScreen />);
    expect(screen.getByText("412.0K")).toBeInTheDocument();
    expect(screen.getByText("▲ 12.4% vs previous")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "30D" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "7D" }));

    expect(screen.getByText("96.1K")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "7D" })).toHaveAttribute("aria-pressed", "true");
  });

  it("breaks traffic down by referrer, country, device and browser", () => {
    renderWithState(<WebAnalyticsScreen />);
    for (const name of ["Direct / none", "United States", "Mobile", "Chrome"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });
});

describe("ApiAnalyticsScreen", () => {
  it("shares the time range with the web screen", async () => {
    const user = userEvent.setup();
    renderWithState(
      <>
        <WebAnalyticsScreen />
        <ApiAnalyticsScreen />
      </>,
    );

    await user.click(screen.getAllByRole("button", { name: "12M" })[0]);

    expect(screen.getByText("4.94M")).toBeInTheDocument();
    expect(screen.getByText("62.40M")).toBeInTheDocument();
  });

  it("lists normalized routes", () => {
    renderWithState(<ApiAnalyticsScreen />);
    const table = screen.getByRole("table", { name: "Traffic by normalized route" });
    expect(within(table).getAllByRole("row")).toHaveLength(7);
    expect(within(table).getByText("/v1/accounts/{g_address}")).toBeInTheDocument();
  });
});

describe("SetupScreen", () => {
  it("switches the snippet with the platform", async () => {
    const user = userEvent.setup();
    renderWithState(<SetupScreen />);
    expect(screen.getByText(/data-site="skyhitz"><\/script>$/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "OpenTelemetry" }));

    expect(screen.getByText("otel-collector.yaml")).toBeInTheDocument();
    expect(screen.getByText(/x-tenant-key: \$\{SES_TENANT_KEY\}/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "OpenTelemetry" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("PrivacyScreen", () => {
  const requestRows = () =>
    within(screen.getByRole("table", { name: "Erasure requests" }))
      .getAllByRole("row")
      .slice(1)
      .map((row) => within(row).getAllByRole("cell").map((cell) => cell.textContent));

  it("needs a target unless the whole site is being erased", async () => {
    const user = userEvent.setup();
    renderWithState(<PrivacyScreen />);

    await user.click(screen.getByRole("button", { name: "Submit request" }));
    expect(screen.getByText("Enter a target for this request.")).toBeInTheDocument();
    expect(requestRows()).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "All data for this site" }));
    expect(screen.queryByText("Enter a target for this request.")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Submit request" }));

    expect(requestRows()[0]).toEqual(["ER-0013", "All data for this site", "skyhitz.io", "Queued"]);
  });

  it("queues a request and clears the field", async () => {
    const user = userEvent.setup();
    renderWithState(<PrivacyScreen />);

    await user.click(screen.getByRole("button", { name: "Date range" }));
    const target = screen.getByLabelText(/Target/);
    expect(target).toHaveAttribute("placeholder", "2026-11-01 to 2026-11-05");
    await user.type(target, "2026-11-01 to 2026-11-05{Enter}");

    expect(requestRows()[0]).toEqual(["ER-0013", "Date range", "2026-11-01 to 2026-11-05", "Queued"]);
    expect(requestRows()[1][3]).toBe("Completed");
    expect(target).toHaveValue("");
  });
});
