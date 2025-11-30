import React, { useState, useEffect, useCallback } from "react";
import { List, Collapse } from "@mui/material";
import type { FileNode } from "../types/fileTree";
import { FileRow } from "./FileRow";
import { SkeletonRow } from "./SkeletonRow";

interface FileTreeProps {
  root: FileNode;
}

interface ExpandedState {
  [id: string]: boolean;
}

interface LoadedChildrenState {
  [id: string]: FileNode[];
}

interface LoadingState {
  [id: string]: boolean;
}

interface ErrorState {
  [id: string]: boolean;
}

/**
 * FileTree component - hierarchical file explorer
 *
 * Features:
 * - Recursive folder nesting
 * - Async loading with skeleton states
 * - Error handling
 * - Caching of loaded children
 * - Full-width clickable rows
 * - Material UI styling
 *
 * @param root - The root FileNode to display
 */
export const FileTree: React.FC<FileTreeProps> = React.memo(({ root }) => {
  // Initialize root as expanded if it has loadChildren
  const [expanded, setExpanded] = useState<ExpandedState>(() =>
    root.loadChildren ? { [root.id]: true } : {}
  );
  const [loadedChildren, setLoadedChildren] = useState<LoadedChildrenState>({});
  const [loading, setLoading] = useState<LoadingState>({});
  const [errors, setErrors] = useState<ErrorState>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(
    !!root.loadChildren
  );

  // Load children for a node
  const loadNodeChildren = useCallback(
    async (node: FileNode) => {
      if (!node.loadChildren) {
        return;
      }

      setLoading((prev) => ({ ...prev, [node.id]: true }));
      setErrors((prev) => ({ ...prev, [node.id]: false }));

      try {
        const children = await node.loadChildren();
        setLoadedChildren((prev) => ({ ...prev, [node.id]: children }));
        if (node.id === root.id) {
          setIsInitialLoading(false);
        }
      } catch (error) {
        console.error(`Error loading children for ${node.name}:`, error);
        setErrors((prev) => ({ ...prev, [node.id]: true }));
      } finally {
        setLoading((prev) => ({ ...prev, [node.id]: false }));
      }
    },
    [root.id]
  );

  // Toggle folder expansion
  const handleToggle = useCallback(
    (node: FileNode) => {
      setExpanded((prev) => {
        const newExpanded = !prev[node.id];

        // Load children when expanding if not already loaded
        if (newExpanded && node.loadChildren) {
          setLoadedChildren((currentLoaded) => {
            if (!currentLoaded[node.id]) {
              // Load children asynchronously
              loadNodeChildren(node);
            }
            return currentLoaded;
          });
        }

        return { ...prev, [node.id]: newExpanded };
      });
    },
    [loadNodeChildren]
  );

  // Handle selection
  const handleSelect = useCallback((node: FileNode) => {
    setSelectedId(node.id);
  }, []);

  // Load root children on initial render
  useEffect(() => {
    if (root.loadChildren) {
      loadNodeChildren(root);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root.id]); // Only depend on root.id to run once per root change

  // Recursive render function
  const renderNode = useCallback(
    (node: FileNode, level: number = 0) => {
      const isExpanded = expanded[node.id] ?? false;
      const isLoading = loading[node.id] ?? false;
      const hasError = errors[node.id] ?? false;
      const children = loadedChildren[node.id] ?? node.children ?? [];
      // Keep original order (no sorting) to match screenshot exactly
      const isSelected = selectedId === node.id;

      return (
        <React.Fragment key={node.id}>
          <FileRow
            node={node}
            isExpanded={isExpanded}
            isLoading={isLoading}
            hasError={hasError}
            level={level}
            isSelected={isSelected}
            onToggle={() => handleToggle(node)}
            onSelect={() => handleSelect(node)}
          />
          {node.type === "folder" && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {isLoading
                  ? // Show skeleton rows while loading
                    Array.from({ length: level === 0 ? 4 : 2 }).map(
                      (_, idx) => (
                        <SkeletonRow
                          key={`skeleton-${node.id}-${idx}`}
                          level={level + 1}
                        />
                      )
                    )
                  : hasError
                  ? // Error state is handled in FileRow component
                    null
                  : children.length > 0
                  ? children.map((child) => renderNode(child, level + 1))
                  : null}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    },
    [
      expanded,
      loading,
      errors,
      loadedChildren,
      selectedId,
      handleToggle,
      handleSelect,
    ]
  );

  return (
    <List
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        py: 0,
      }}
      component="nav"
    >
      {isInitialLoading
        ? // Show skeleton rows for initial root loading
          Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonRow key={`root-skeleton-${idx}`} level={0} />
          ))
        : renderNode(root, 0)}
    </List>
  );
});

FileTree.displayName = "FileTree";
