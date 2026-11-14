/**
 * Tests for MobileStepper component
 */
import { render, screen, fireEvent } from "@testing-library/react";
import Stepper from "@/components/MobileStepper";

describe("MobileStepper", () => {
  const mockOnChange = jest.fn();

  it("renders all 4 steps", () => {
    render(<Stepper step="select" onChange={mockOnChange} />);

    expect(screen.getByText("Template")).toBeInTheDocument();
    expect(screen.getByText("Capture")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("marks the current step as active", () => {
    render(<Stepper step="capture" onChange={mockOnChange} />);

    const captureButton = screen.getByText("Capture");
    expect(captureButton).toBeInTheDocument();
    expect(captureButton).toHaveClass("text-indigo-400");
  });

  it("calls onChange when step is clicked", () => {
    render(<Stepper step="select" onChange={mockOnChange} />);

    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    expect(mockOnChange).toHaveBeenCalledWith("edit");
  });

  it("marks completed steps correctly", () => {
    render(<Stepper step="edit" onChange={mockOnChange} />);

    // Select should be completed (not active, not current)
    const selectButton = screen.getByText("Template");
    expect(selectButton).toHaveClass("text-slate-300");

    // Capture should be completed (it was current before edit)
    const captureButton = screen.getByText("Capture");
    expect(captureButton).toHaveClass("text-slate-300");
  });
});