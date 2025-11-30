import React from "react";
import {
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Box,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  Folder as FolderIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  KeyboardArrowDown,
  KeyboardArrowRight,
  ErrorOutline,
} from "@mui/icons-material";
import type { FileNode } from "../types/fileTree";

interface FileRowProps {
  node: FileNode;
  isExpanded: boolean;
  isLoading: boolean;
  hasError: boolean;
  level: number;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
}

/**
 * Get file icon component based on file extension
 */
const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  if (["doc", "docx"].includes(extension)) {
    return <DocumentIcon sx={{ color: "white", fontSize: 20 }} />;
  }
  if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(extension)) {
    return <ImageIcon sx={{ color: "white", fontSize: 20 }} />;
  }
  return <FileIcon sx={{ color: "white", fontSize: 20 }} />;
};

/**
 * Get background color for file icon circle based on file type
 */
const getFileIconColor = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  if (["doc", "docx"].includes(extension)) {
    return "#2196F3"; // Blue
  }
  if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(extension)) {
    return "#26A69A"; // Teal
  }
  return "#757575"; // Gray
};

/**
 * FileRow component - renders a single file or folder row
 * Features:
 * - Circular colored icons
 * - Chevron for folders
 * - File size display for files
 * - Hover and selection states
 * - Loading and error states
 */
export const FileRow: React.FC<FileRowProps> = React.memo(
  ({
    node,
    isExpanded,
    isLoading,
    hasError,
    level,
    isSelected,
    onToggle,
    onSelect,
  }) => {
    const isFolder = node.type === "folder";
    const indent = level * 24; // 24px per level for visible indentation

    const handleClick = () => {
      if (isFolder) {
        onToggle();
      }
      onSelect();
    };

    return (
      <ListItem disablePadding>
        <ListItemButton
          onClick={handleClick}
          selected={isSelected}
          sx={{
            pl: `${indent + 2}px`,
            pr: 1,
            py: 1.5,
            transition: "background-color 0.2s ease",
            backgroundColor: isSelected ? "rgba(0, 0, 0, 0.04)" : "transparent",
            "&.Mui-selected": {
              backgroundColor: "rgba(0, 0, 0, 0.06)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.08)",
              },
            },
            "&:hover": {
              backgroundColor: isSelected
                ? "rgba(0, 0, 0, 0.08)"
                : "rgba(0, 0, 0, 0.04)",
            },
            "&:active": {
              backgroundColor: "rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              gap: 2,
            }}
          >
            {/* Icon */}
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 40 }}>
              {isLoading ? (
                <CircularProgress
                  size={20}
                  thickness={4}
                  sx={{ color: "text.secondary" }}
                />
              ) : hasError ? (
                <ErrorOutline sx={{ color: "error.main", fontSize: 24 }} />
              ) : isFolder ? (
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "#FFA726", // Yellow
                  }}
                >
                  <FolderIcon sx={{ color: "white", fontSize: 20 }} />
                </Avatar>
              ) : (
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: getFileIconColor(node.name),
                  }}
                >
                  {getFileIcon(node.name)}
                </Avatar>
              )}
            </Box>

            {/* Text content */}
            <ListItemText
              primary={
                <Box>
                  <Typography
                    variant="body1"
                    component="span"
                    sx={{
                      color: "text.primary",
                      fontWeight: 400,
                      fontSize: "0.9375rem",
                    }}
                  >
                    {node.name}
                  </Typography>
                  {!isFolder && node.sizeKB && (
                    <Typography
                      variant="caption"
                      component="div"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.75rem",
                        mt: 0.25,
                      }}
                    >
                      {node.sizeKB}KB
                    </Typography>
                  )}
                  {hasError && (
                    <Typography
                      variant="caption"
                      component="div"
                      sx={{
                        color: "error.main",
                        fontSize: "0.75rem",
                        mt: 0.25,
                      }}
                    >
                      Failed to load files
                    </Typography>
                  )}
                </Box>
              }
              sx={{ m: 0, flex: 1 }}
            />

            {/* Chevron for folders */}
            {isFolder && !isLoading && !hasError && (
              <IconButton
                size="small"
                sx={{
                  minWidth: 32,
                  color: "text.secondary",
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
              >
                {isExpanded ? (
                  <KeyboardArrowDown fontSize="small" />
                ) : (
                  <KeyboardArrowRight fontSize="small" />
                )}
              </IconButton>
            )}
          </Box>
        </ListItemButton>
      </ListItem>
    );
  }
);

FileRow.displayName = "FileRow";
