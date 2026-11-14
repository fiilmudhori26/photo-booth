/**
 * Tests for the live Stepper (components/ui.tsx) used by the app.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { Stepper } from "@/components/ui";

describe("Stepper", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all 4 steps", () => {
    render(<Stepper step="select" onChange={mockOnChange} />);

    expect(screen.getByRole("button", { name: "Template" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Capture" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
  });

  it("marks the current step as active (aria-current)", () => {
    render(<Stepper step="capture" onChange={mockOnChange} />);

    const captureButton = screen.getByRole("button", { name: "Capture" });
    expect(captureButton).toHaveAttribute("aria-current", "step");
    expect(captureButton).toHaveClass("text-indigo-300");
  });

  it("marks completed steps with the completed style", () => {
    render(<Stepper step="edit" onChange={mockOnChange} />);

    const selectButton = screen.getByRole("button", { name: "Template" });
    expect(selectButton).toHaveClass("text-slate-200");

    const captureButton = screen.getByRole("button", { name: "Capture" });
    expect(captureButton).toHaveClass("text-slate-200");
  });

  it("is not marked completed for the active step", () => {
    render(<Stepper step="edit" onChange={mockOnChange} />);

    const editButton = screen.getByRole("button", { name: "Edit" });
    expect(editButton).not.toHaveClass("text-slate-200");
    expect(editButton).toHaveClass("text-indigo-300");
  });

  it("calls onChange when a step is clicked", () => {
    render(<Stepper step="select" onChange={mockOnChange} />);

    const editButton = screen.getByRole("button", { name: "Edit" });
    fireEvent.click(editButton);

    expect(mockOnChange).toHaveBeenCalledWith("edit");
  });

  it("disables all navigation and sets aria-disabled when disabled", () => {
    render(<Stepper step="capture" onChange={mockOnChange} disabled />);

    for (const label of ["Template", "Capture", "Edit", "Export"]) {
      const button = screen.getByRole("button", { name: label });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
    }

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
