/**
 * Tests for the live SelectStep (components/steps/SelectStep.tsx) used by the app.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import SelectStep from "@/components/steps/SelectStep";
import type { TemplateId } from "@/lib/types";

describe("SelectStep", () => {
  const mockOnSelect = jest.fn();
  const mockOnContinue = jest.fn();
  const defaultProps = {
    selectedTemplate: "boarding-pass" as TemplateId,
    onSelect: mockOnSelect,
    onContinue: mockOnContinue,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the category filter buttons", () => {
    render(<SelectStep {...defaultProps} />);

    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tickets" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retro" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Minimalist" })).toBeInTheDocument();
  });

  it("renders all 5 template cards", () => {
    render(<SelectStep {...defaultProps} />);

    for (const name of [
      "Boarding Pass",
      "Vintage Movie Ticket",
      "Modern Graphic",
      "Air Mail Postal",
      "Theater Show Ticket",
    ]) {
      expect(
        screen.getByRole("button", { name: new RegExp(name) }),
      ).toBeInTheDocument();
    }
  });

  it("marks the selected template card with aria-pressed and the indigo border", () => {
    render(<SelectStep {...defaultProps} selectedTemplate="boarding-pass" />);

    const selected = screen.getByRole("button", { name: /Boarding Pass/ });
    expect(selected).toHaveAttribute("aria-pressed", "true");
    expect(selected).toHaveClass("border-indigo-500");

    const other = screen.getByRole("button", { name: /Modern Graphic/ });
    expect(other).toHaveAttribute("aria-pressed", "false");
    expect(other).not.toHaveClass("border-indigo-500");
  });

  it("filters templates by category", () => {
    render(<SelectStep {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Tickets" }));

    expect(
      screen.getByRole("button", { name: /Boarding Pass/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Vintage Movie Ticket/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Theater Show Ticket/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Modern Graphic/ }),
    ).not.toBeInTheDocument();
  });

  it("calls onSelect when a template card is clicked", () => {
    render(<SelectStep {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Vintage Movie Ticket/ }));

    expect(mockOnSelect).toHaveBeenCalledWith("vintage-movie");
  });

  it("calls onContinue when Continue to Camera is clicked", () => {
    render(<SelectStep {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Continue to Camera/ }));

    expect(mockOnContinue).toHaveBeenCalled();
  });

  it("shows the slot-strip badge copy", () => {
    render(<SelectStep {...defaultProps} />);

    expect(screen.getAllByText("4-slot strip")).toHaveLength(2);
    expect(screen.getAllByText("8-slot strip")).toHaveLength(3);
  });
});
