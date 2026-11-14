import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithState } from "@/test/render";
import { EnrollmentScreen } from "./EnrollmentScreen";

async function fillProject(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Project name/), "My App");
  await user.type(screen.getByLabelText(/Website domain/), "my.app");
  await user.type(screen.getByLabelText(/Contact email/), "team@my.app");
}

describe("EnrollmentScreen", () => {
  it("explains what is missing and stays on the first step", async () => {
    const user = userEvent.setup();
    renderWithState(<EnrollmentScreen />);

    await user.click(screen.getByRole("button", { name: "Continue →" }));

    expect(screen.getByText("Enter a project name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a domain like skyhitz.io.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email.")).toBeInTheDocument();
    expect(screen.getByLabelText(/Project name/)).toBeInvalid();
    expect(screen.getByRole("button", { name: "Continue →" })).toBeInTheDocument();
  });

  it("clears a field's message as soon as that field is edited", async () => {
    const user = userEvent.setup();
    renderWithState(<EnrollmentScreen />);
    await user.click(screen.getByRole("button", { name: "Continue →" }));

    await user.type(screen.getByLabelText(/Project name/), "M");

    expect(screen.queryByText("Enter a project name.")).not.toBeInTheDocument();
    expect(screen.getByText("Enter a valid email.")).toBeInTheDocument();
  });

  it("requires something to measure", async () => {
    const user = userEvent.setup();
    renderWithState(<EnrollmentScreen />);
    await fillProject(user);

    await user.click(screen.getByRole("checkbox", { name: /Website/ }));
    await user.click(screen.getByRole("button", { name: "Continue →" }));

    expect(screen.getByText("Choose at least one.")).toBeInTheDocument();
  });

  it("walks a website through install and verification", async () => {
    const user = userEvent.setup();
    renderWithState(<EnrollmentScreen />);
    await fillProject(user);
    await user.click(screen.getByRole("button", { name: "Continue →" }));

    expect(screen.getByText("Add this to my.app")).toBeInTheDocument();
    expect(screen.getByText(/data-site="my-app"/)).toBeInTheDocument();
    expect(screen.getByText(/pinned to v1\.4\.2/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "I've added it →" }));
    expect(screen.getByText("○ Waiting for the first event…")).toBeInTheDocument();
    expect(screen.getByText(/Open my\.app in a browser/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Simulate first event" }));
    expect(screen.getByText("● First event received")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open dashboard →" })).toHaveAttribute("href", "/tenant/web");
  });

  it("gives an API-only project the collector config instead of the script", async () => {
    const user = userEvent.setup();
    renderWithState(<EnrollmentScreen />);
    await fillProject(user);
    await user.click(screen.getByRole("checkbox", { name: /Website/ }));
    await user.click(screen.getByRole("checkbox", { name: /API/ }));
    await user.click(screen.getByRole("button", { name: "Continue →" }));

    expect(screen.getByText("Add this to otel-collector.yaml")).toBeInTheDocument();
    expect(screen.getByText(/otlphttp\/scf/)).toBeInTheDocument();
    expect(screen.queryByText(/data-site=/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "I've added it →" }));
    expect(screen.getByText(/Send a request to your API/)).toBeInTheDocument();
  });

  it("keeps the form when going back", async () => {
    const user = userEvent.setup();
    renderWithState(<EnrollmentScreen />);
    await fillProject(user);
    await user.click(screen.getByRole("button", { name: "Continue →" }));

    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByLabelText(/Project name/)).toHaveValue("My App");
    expect(screen.getByLabelText(/Contact email/)).toHaveValue("team@my.app");
  });

  it("marks the current step", async () => {
    const user = userEvent.setup();
    renderWithState(<EnrollmentScreen />);
    expect(screen.getByText(/01 · Project/)).toHaveAttribute("aria-current", "step");

    await fillProject(user);
    await user.click(screen.getByRole("button", { name: "Continue →" }));

    expect(screen.getByText(/02 · Install/)).toHaveAttribute("aria-current", "step");
    expect(screen.getByText(/01 · Project/)).not.toHaveAttribute("aria-current");
  });
});
