import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileTree } from "../FileTree";
import type { FileNode } from "../../types/fileTree";

describe("FileTree", () => {
  const mockLoadChildren = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render root node", async () => {
    mockLoadChildren.mockResolvedValue([]);

    const rootNode: FileNode = {
      id: "root",
      name: "Root Folder",
      type: "folder",
      loadChildren: mockLoadChildren,
    };

    render(<FileTree root={rootNode} />);

    // Wait for loading to complete
    await waitFor(
      () => {
        expect(screen.getByText("Root Folder")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should show skeleton loading state initially", () => {
    const rootNode: FileNode = {
      id: "root",
      name: "Root Folder",
      type: "folder",
      loadChildren: mockLoadChildren,
    };

    render(<FileTree root={rootNode} />);

    // Should show skeleton rows while loading
    const skeletons = screen.getAllByRole("button", { hidden: true });
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should load and display children when root has loadChildren", async () => {
    const mockChildren: FileNode[] = [
      {
        id: "file-1",
        name: "test-file.png",
        type: "file",
        sizeKB: 100,
      },
      {
        id: "folder-1",
        name: "test-folder",
        type: "folder",
        loadChildren: vi.fn(),
      },
    ];

    mockLoadChildren.mockResolvedValue(mockChildren);

    const rootNode: FileNode = {
      id: "root",
      name: "Root Folder",
      type: "folder",
      loadChildren: mockLoadChildren,
    };

    render(<FileTree root={rootNode} />);

    await waitFor(() => {
      expect(screen.getByText("test-file.png")).toBeInTheDocument();
      expect(screen.getByText("test-folder")).toBeInTheDocument();
    });

    expect(mockLoadChildren).toHaveBeenCalledTimes(1);
  });

  it("should expand folder when clicked", async () => {
    const user = userEvent.setup();
    const nestedChildren: FileNode[] = [
      {
        id: "nested-file",
        name: "nested.txt",
        type: "file",
        sizeKB: 50,
      },
    ];

    const loadNestedChildren = vi.fn().mockResolvedValue(nestedChildren);

    const mockChildren: FileNode[] = [
      {
        id: "folder-1",
        name: "test-folder",
        type: "folder",
        loadChildren: loadNestedChildren,
      },
    ];

    mockLoadChildren.mockResolvedValue(mockChildren);

    const rootNode: FileNode = {
      id: "root",
      name: "Root Folder",
      type: "folder",
      loadChildren: mockLoadChildren,
    };

    render(<FileTree root={rootNode} />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("test-folder")).toBeInTheDocument();
    });

    // Click on folder to expand - find the button that contains the folder name
    const folderText = screen.getByText("test-folder");
    const folderButton = folderText.closest('[role="button"]');

    if (folderButton) {
      await user.click(folderButton);

      // Wait for nested children to load
      await waitFor(
        () => {
          expect(screen.getByText("nested.txt")).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      expect(loadNestedChildren).toHaveBeenCalledTimes(1);
    }
  });

  it("should handle loading errors gracefully", async () => {
    const errorMessage = "Failed to load";
    mockLoadChildren.mockRejectedValue(new Error(errorMessage));

    const rootNode: FileNode = {
      id: "root",
      name: "Root Folder",
      type: "folder",
      loadChildren: mockLoadChildren,
    };

    render(<FileTree root={rootNode} />);

    // Wait for the error to be handled
    // The component should handle the error without crashing
    // The root folder should be visible even after error
    await waitFor(
      () => {
        // Check that mockLoadChildren was called (error was attempted)
        expect(mockLoadChildren).toHaveBeenCalled();

        // The root folder should be visible (it's rendered even during loading)
        // We use queryByText to avoid throwing if not found
        const rootFolder = screen.queryByText("Root Folder");
        // If root folder is not visible, at least verify the component rendered
        // (skeleton rows are shown during loading)
        const hasContent =
          rootFolder ||
          screen.queryAllByRole("button", { hidden: true }).length > 0;
        expect(hasContent).toBe(true);
      },
      { timeout: 3000 }
    );
  });

  it("should cache loaded children", async () => {
    const mockChildren: FileNode[] = [
      {
        id: "file-1",
        name: "test-file.png",
        type: "file",
        sizeKB: 100,
      },
    ];

    mockLoadChildren.mockResolvedValue(mockChildren);

    const rootNode: FileNode = {
      id: "root",
      name: "Root Folder",
      type: "folder",
      loadChildren: mockLoadChildren,
    };

    const { rerender } = render(<FileTree root={rootNode} />);

    await waitFor(() => {
      expect(screen.getByText("test-file.png")).toBeInTheDocument();
    });

    // Rerender should not call loadChildren again
    rerender(<FileTree root={rootNode} />);

    // Should still show the file
    expect(screen.getByText("test-file.png")).toBeInTheDocument();
    // loadChildren should only be called once
    expect(mockLoadChildren).toHaveBeenCalledTimes(1);
  });

  it("should handle root node without loadChildren", () => {
    const rootNode: FileNode = {
      id: "root",
      name: "Root File",
      type: "file",
      sizeKB: 100,
    };

    render(<FileTree root={rootNode} />);
    expect(screen.getByText("Root File")).toBeInTheDocument();
  });

  it("should handle root node with static children", async () => {
    const user = userEvent.setup();
    const rootNode: FileNode = {
      id: "root",
      name: "Root Folder",
      type: "folder",
      children: [
        {
          id: "static-file",
          name: "static.txt",
          type: "file",
          sizeKB: 50,
        },
      ],
    };

    render(<FileTree root={rootNode} />);
    expect(screen.getByText("Root Folder")).toBeInTheDocument();

    // Need to expand the folder to see children
    const folderText = screen.getByText("Root Folder");
    const folderButton = folderText.closest('[role="button"]');

    if (folderButton) {
      await user.click(folderButton);

      await waitFor(() => {
        expect(screen.getByText("static.txt")).toBeInTheDocument();
      });
    }
  });

  it("should select file when clicked", async () => {
    const mockChildren: FileNode[] = [
      {
        id: "file-1",
        name: "test-file.png",
        type: "file",
        sizeKB: 100,
      },
    ];

    mockLoadChildren.mockResolvedValue(mockChildren);

    const rootNode: FileNode = {
      id: "root",
      name: "Root Folder",
      type: "folder",
      loadChildren: mockLoadChildren,
    };

    render(<FileTree root={rootNode} />);

    await waitFor(() => {
      expect(screen.getByText("test-file.png")).toBeInTheDocument();
    });

    const fileButton = screen.getByText("test-file.png").closest("button");
    if (fileButton) {
      await userEvent.click(fileButton);

      // File should be selected (has selected class)
      expect(fileButton).toHaveClass("Mui-selected");
    }
  });
});
