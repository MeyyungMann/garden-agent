import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlantFormDialog } from "@/components/crud/plant-form-dialog";
import { createPlant, updatePlant } from "@/actions/plants";

afterEach(cleanup);

// Mock Dialog to render inline
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, variant: _v, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label {...props}>{children}</label>
  ),
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange, value }: { children: React.ReactNode; onValueChange: (v: string) => void; value: string }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>{children}</select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <option value="">{placeholder ?? ""}</option>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
}));

const mockedCreatePlant = vi.mocked(createPlant);
const mockedUpdatePlant = vi.mocked(updatePlant);

describe("PlantFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows 'Add Plant' title in create mode", () => {
    render(<PlantFormDialog open={true} onOpenChange={vi.fn()} />);
    // Title is in h2, button has the same text
    expect(screen.getByRole("heading", { name: "Add Plant" })).toBeInTheDocument();
  });

  it("shows 'Edit Plant' title in edit mode", () => {
    render(
      <PlantFormDialog
        open={true}
        onOpenChange={vi.fn()}
        plant={{
          id: "1",
          name: "Tomato",
          variety: null,
          type: "VEGETABLE",
          daysToMaturity: null,
          sunRequirement: null,
          waterNeeds: null,
          growingNotes: null,
        }}
      />
    );
    expect(screen.getByRole("heading", { name: "Edit Plant" })).toBeInTheDocument();
  });

  it("populates fields in edit mode", () => {
    render(
      <PlantFormDialog
        open={true}
        onOpenChange={vi.fn()}
        plant={{
          id: "1",
          name: "Tomato",
          variety: "Roma",
          type: "VEGETABLE",
          daysToMaturity: 75,
          sunRequirement: "FULL_SUN",
          waterNeeds: "HIGH",
          growingNotes: "Needs staking",
        }}
      />
    );
    expect(screen.getByDisplayValue("Tomato")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Roma")).toBeInTheDocument();
    expect(screen.getByDisplayValue("75")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Needs staking")).toBeInTheDocument();
  });

  it("calls createPlant on submit in create mode", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    mockedCreatePlant.mockResolvedValue({
      id: "new-id",
      name: "Basil",
      variety: null,
      type: "HERB",
      daysToMaturity: null,
      sunRequirement: null,
      waterNeeds: null,
      growingNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    render(<PlantFormDialog open={true} onOpenChange={onOpenChange} />);

    const nameInput = screen.getByLabelText("Name *");
    await user.clear(nameInput);
    await user.type(nameInput, "Basil");

    const submitBtn = screen.getByRole("button", { name: /Add Plant/i });
    await user.click(submitBtn);

    expect(mockedCreatePlant).toHaveBeenCalledOnce();
    expect(mockedCreatePlant.mock.calls[0][0].name).toBe("Basil");
  });

  it("calls updatePlant on submit in edit mode", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    mockedUpdatePlant.mockResolvedValue({
      id: "1",
      name: "Cherry Tomato",
      variety: null,
      type: "VEGETABLE",
      daysToMaturity: null,
      sunRequirement: null,
      waterNeeds: null,
      growingNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    render(
      <PlantFormDialog
        open={true}
        onOpenChange={onOpenChange}
        plant={{
          id: "1",
          name: "Tomato",
          variety: null,
          type: "VEGETABLE",
          daysToMaturity: null,
          sunRequirement: null,
          waterNeeds: null,
          growingNotes: null,
        }}
      />
    );

    const nameInput = screen.getByDisplayValue("Tomato");
    await user.clear(nameInput);
    await user.type(nameInput, "Cherry Tomato");

    const submitBtn = screen.getByRole("button", { name: /Save Changes/i });
    await user.click(submitBtn);

    expect(mockedUpdatePlant).toHaveBeenCalledOnce();
    expect(mockedUpdatePlant.mock.calls[0][0]).toBe("1");
  });

  it("shows error message on failure", async () => {
    const user = userEvent.setup();
    mockedCreatePlant.mockRejectedValue(new Error("Duplicate plant"));

    render(<PlantFormDialog open={true} onOpenChange={vi.fn()} />);

    const nameInput = screen.getByLabelText("Name *");
    await user.type(nameInput, "Tomato");
    await user.click(screen.getByRole("button", { name: /Add Plant/i }));

    expect(await screen.findByText("Duplicate plant")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<PlantFormDialog open={false} onOpenChange={vi.fn()} />);
    expect(screen.queryByRole("heading", { name: "Add Plant" })).not.toBeInTheDocument();
  });
});
