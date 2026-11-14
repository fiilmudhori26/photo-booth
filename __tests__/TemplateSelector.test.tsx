/**
 * Tests for TemplateSelector component
 */
import { render, screen, fireEvent } from "@testing-library/react";
import TemplateSelector, { TemplateCategory } from "@/components/TemplateSelector";
import type { TemplateId } from "@/lib/types";

// Mock TEMPLATE_LIST
jest.mock("@/lib/templates", () => ({
  TEMPLATE_LIST: [
    {
      id: "boarding-pass",
      name: "Boarding Pass",
      photoSlots: [{ x: 60, y: 140, w: 520, h: 390 }, { x: 600, y: 140, w: 520, h: 390 }, { x: 60, y: 570, w: 520, h: 390 }, { x: 600, y: 570, w: 520, h: 390 }],
    },
    {
      id: "vintage-movie",
      name: "Vintage Movie Ticket",
      photoSlots: [
        { x: 80, y: 120, w: 300, h: 225 },
        { x: 80, y: 365, w: 300, h: 225 },
        { x: 80, y: 610, w: 300, h: 225 },
        { x: 80, y: 855, w: 300, h: 225 },
      ],
    },
  ],
}));

describe("TemplateSelector", () => {
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

  it("renders category filter buttons", () => {
    render(<TemplateSelector {...defaultProps} />);

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Ticket")).toBeInTheDocument();
    expect(screen.getByText("Retro")).toBeInTheDocument();
    expect(screen.getByText("Minimalist")).toBeInTheDocument();
  });

  it("renders template cards", () => {
    render(<TemplateSelector {...defaultProps} />);

    expect(screen.getByText("Boarding Pass")).toBeInTheDocument();
    expect(screen.getByText("Vintage Movie Ticket")).toBeInTheDocument();
  });

  it("highlights selected template", () => {
    render(<TemplateSelector {...defaultProps} selectedTemplate="boarding-pass" />);

    const checkmark = screen.getByRole("img", { hidden: true });
    expect(checkmark).toBeInTheDocument();
  });

  it("calls onSelect when template is clicked", () => {
    render(<TemplateSelector {...defaultProps} />);

    const vintageButton = screen.getByText("Vintage Movie Ticket").closest("button");
    fireEvent.click(vintageButton!);

    expect(mockOnSelect).toHaveBeenCalledWith("vintage-movie");
  });

  it("calls onContinue when continue button is clicked", () => {
    render(<TemplateSelector {...defaultProps} />);

    const continueButton = screen.getByText("Continue to Camera");
    fireEvent.click(continueButton);

    expect(mockOnContinue).toHaveBeenCalled();
  });

  it("disables continue button when no template selected", () => {
    render(
      <TemplateSelector {...defaultProps} selectedTemplate={"" as TemplateId} />,
    );

    const continueButton = screen.getByText("Continue to Camera");
    expect(continueButton).toBeDisabled();
  });

  it("filters templates by category", () => {
    render(<TemplateSelector {...defaultProps} />);

    const ticketButton = screen.getByText("Ticket");
    fireEvent.click(ticketButton);

    expect(screen.getByText("Boarding Pass")).toBeInTheDocument();
  });
});

describe("Template Categories", () => {
  it("defines all expected categories", () => {
    const categories: TemplateCategory[] = ["all", "ticket", "retro", "minimalist"];

    categories.forEach((category) => {
      expect(typeof category).toBe("string");
    });
  });
});