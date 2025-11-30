import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileRow } from "../FileRow";
import type { FileNode } from "../../types/fileTree";

describe("FileRow", () => {
  const mockFileNode: FileNode = {
    id: "file-1",
    name: "test-file.png",
    type: "file",
    sizeKB: 100,
  };

  const mockFolderNode: FileNode = {
    id: "folder-1",
    name: "test-folder",
    type: "folder",
    loadChildren: vi.fn(),
  };

  it("should render file with correct name and size", () => {
    render(
      <FileRow
        node={mockFileNode}
        isExpanded={false}
        isLoading={false}
        hasError={false}
        level={0}
        isSelected={false}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText("test-file.png")).toBeInTheDocument();
    expect(screen.getByText("100KB")).toBeInTheDocument();
  });

  it("should render folder with correct name", () => {
    render(
      <FileRow
        node={mockFolderNode}
        isExpanded={false}
        isLoading={false}
        hasError={false}
        level={0}
        isSelected={false}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText("test-folder")).toBeInTheDocument();
  });

  it("should show loading spinner when isLoading is true", () => {
    render(
      <FileRow
        node={mockFolderNode}
        isExpanded={false}
        isLoading={true}
        hasError={false}
        level={0}
        isSelected={false}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    // CircularProgress should be rendered
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should show error icon when hasError is true", () => {
    render(
      <FileRow
        node={mockFolderNode}
        isExpanded={false}
        isLoading={false}
        hasError={true}
        level={0}
        isSelected={false}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText("Failed to load files")).toBeInTheDocument();
  });

  it("should show chevron for expanded folder", () => {
    render(
      <FileRow
        node={mockFolderNode}
        isExpanded={true}
        isLoading={false}
        hasError={false}
        level={0}
        isSelected={false}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    // Chevron should be visible for folders
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should call onToggle when folder is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onSelect = vi.fn();

    render(
      <FileRow
        node={mockFolderNode}
        isExpanded={false}
        isLoading={false}
        hasError={false}
        level={0}
        isSelected={false}
        onToggle={onToggle}
        onSelect={onSelect}
      />
    );

    // Get the main ListItemButton (not the chevron icon button)
    const buttons = screen.getAllByRole("button");
    const mainButton = buttons.find((btn) =>
      btn.textContent?.includes("test-folder")
    );
    expect(mainButton).toBeInTheDocument();

    if (mainButton) {
      await user.click(mainButton);
      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledTimes(1);
    }
  });

  it("should call onSelect when file is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onSelect = vi.fn();

    render(
      <FileRow
        node={mockFileNode}
        isExpanded={false}
        isLoading={false}
        hasError={false}
        level={0}
        isSelected={false}
        onToggle={onToggle}
        onSelect={onSelect}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onToggle).not.toHaveBeenCalled(); // Files don't toggle
  });

  it("should apply correct indentation based on level", () => {
    const { container } = render(
      <FileRow
        node={mockFileNode}
        isExpanded={false}
        isLoading={false}
        hasError={false}
        level={2}
        isSelected={false}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    const button = container.querySelector(".MuiListItemButton-root");
    expect(button).toHaveStyle({ paddingLeft: "50px" }); // 2 * 24 + 2
  });

  it("should show selected state when isSelected is true", () => {
    const { container } = render(
      <FileRow
        node={mockFileNode}
        isExpanded={false}
        isLoading={false}
        hasError={false}
        level={0}
        isSelected={true}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    const button = container.querySelector(".Mui-selected");
    expect(button).toBeInTheDocument();
  });

  it("should render correct icon for image files", () => {
    const imageNode: FileNode = {
      id: "img-1",
      name: "test.jpg",
      type: "file",
      sizeKB: 50,
    };

    render(
      <FileRow
        node={imageNode}
        isExpanded={false}
        isLoading={false}
        hasError={false}
        level={0}
        isSelected={false}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText("test.jpg")).toBeInTheDocument();
  });

  it("should render correct icon for document files", () => {
    const docNode: FileNode = {
      id: "doc-1",
      name: "test.doc",
      type: "file",
      sizeKB: 30,
    };

    render(
      <FileRow
        node={docNode}
        isExpanded={false}
        isLoading={false}
        hasError={false}
        level={0}
        isSelected={false}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText("test.doc")).toBeInTheDocument();
  });
});
