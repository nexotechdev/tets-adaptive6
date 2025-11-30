import React from "react";
import { ListItem, ListItemButton, Box, Skeleton } from "@mui/material";

interface SkeletonRowProps {
  level: number;
}

/**
 * Skeleton loading row component for file explorer
 * Displays a placeholder row with circular icon skeleton and text skeletons
 */
export const SkeletonRow: React.FC<SkeletonRowProps> = React.memo(
  ({ level }) => {
    const indent = level * 24; // 24px per level for visible indentation

    return (
      <ListItem disablePadding>
        <ListItemButton
          disabled
          sx={{
            pl: `${indent + 2}px`,
            py: 1.5,
            "&:hover": {
              backgroundColor: "transparent",
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
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton
                variant="text"
                width="40%"
                height={16}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
        </ListItemButton>
      </ListItem>
    );
  }
);

SkeletonRow.displayName = "SkeletonRow";
