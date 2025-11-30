import { FileTree } from "./components/FileTree";
import type { FileNode } from "./types/fileTree";
import { fetchFakeFiles } from "./services/fakeFileService";
import { Box, Paper } from "@mui/material";
import "./App.css";

function App() {
  // Create root folder that loads children async
  const rootNode: FileNode = {
    id: "root",
    name: "liable-owl",
    type: "folder",
    loadChildren: () => fetchFakeFiles("root"),
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        bgcolor: "background.default",
        py: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: { xs: "100%" },
          mx: "auto",
          px: { xs: 2, md: 3 },
        }}
      >
        <Paper
          elevation={1}
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            width: "100%",
          }}
        >
          <FileTree root={rootNode} />
        </Paper>
      </Box>
    </Box>
  );
}

export default App;
