import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteConfirmationDialog } from "@/components/crud/delete-confirmation-dialog";

afterEach(cleanup);

// Mock Dialog components to render inline (avoid portal issues in tests)
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Button — filter non-HTML props before rendering
vi.mock("@/components/ui/button", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: ({ children, variant: _variant, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

describe("DeleteConfirmationDialog", () => {
  it("renders title and description when open", () => {
    render(
      <DeleteConfirmationDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Delete Tomato?"
        description="This will remove the plant and all its seeds."
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByText("Delete Tomato?")).toBeInTheDocument();
    expect(screen.getByText("This will remove the plant and all its seeds.")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <DeleteConfirmationDialog
        open={false}
        onOpenChange={vi.fn()}
        title="Delete?"
        onConfirm={vi.fn()}
      />
    );
    expect(screen.queryByText("Delete?")).not.toBeInTheDocument();
  });

  it("calls onConfirm and closes on delete click", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();

    render(
      <DeleteConfirmationDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Delete?"
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByText("Delete"));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onOpenChange(false) on cancel click", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <DeleteConfirmationDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Delete?"
        onConfirm={vi.fn()}
      />
    );

    await user.click(screen.getByText("Cancel"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows 'Deleting...' text while confirming", async () => {
    const user = userEvent.setup();
    let resolveConfirm: () => void;
    const onConfirm = vi.fn().mockReturnValue(
      new Promise<void>((resolve) => { resolveConfirm = resolve; })
    );

    render(
      <DeleteConfirmationDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Delete?"
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByText("Delete"));
    expect(screen.getByText("Deleting...")).toBeInTheDocument();

    resolveConfirm!();
  });
});
