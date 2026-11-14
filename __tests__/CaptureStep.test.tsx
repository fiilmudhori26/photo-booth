/**
 * Regression test: after a successful capture sequence, the stepper must be
 * re-enabled (captureRunning must not leak as permanently true).
 * Mocks the camera, filters and sound so the full app flow can run headless.
 */
import { render, screen, fireEvent, act } from "@testing-library/react";
import PhotoBoothApp from "@/components/PhotoBoothApp";

jest.mock("@/lib/useCamera", () => ({
  __esModule: true,
  useCamera: () => ({
    status: "ready",
    videoRef: { current: null },
    errorMessage: "",
    retry: jest.fn(),
    devices: [{ deviceId: "fake-1", label: "Fake Camera", kind: "videoinput" }],
    activeDeviceLabel: "Fake Camera",
    switchCamera: jest.fn(),
    captureFrame: jest.fn(() => "data:image/png;base64,fakeframe"),
  }),
}));

jest.mock("@/lib/filters", () => ({
  __esModule: true,
  FILTER_PRESETS: [
    { id: "normal", label: "Soft Normal", icon: "🙂", hint: "True to life" },
  ],
  renderFilteredShot: jest.fn(async (raw: string) => raw),
}));

jest.mock("@/lib/sound", () => ({
  __esModule: true,
  sfx: new Proxy({}, { get: () => jest.fn() }),
}));

describe("Capture flow (app level)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("re-enables the stepper after capture completes and advances to edit", async () => {
    render(<PhotoBoothApp />);

    // Advance from select to capture
    fireEvent.click(screen.getByRole("button", { name: /Continue to Camera/ }));

    // Sanity: stepper enabled before capture
    expect(screen.getByRole("button", { name: "Edit" })).not.toBeDisabled();

    // Start the capture sequence
    fireEvent.click(screen.getByRole("button", { name: /Start Capture/ }));

    // While the sequence runs, step navigation is locked
    expect(screen.getByRole("button", { name: "Edit" })).toBeDisabled();

    // Fast-forward through countdown + shots + pose gaps
    await act(async () => {
      await jest.advanceTimersByTimeAsync(25000);
    });

    // After success, the app advanced to the edit step and the stepper is enabled again
    expect(screen.getByText("Edit your photos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).not.toBeDisabled();
  });
});
