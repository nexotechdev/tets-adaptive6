import type { FileNode } from "../types/fileTree";

/**
 * Fake async file fetch service that simulates loading files from a server
 * Returns the exact files and folders shown in the screenshots
 * @param parentId - The ID of the parent folder
 * @returns Promise that resolves to an array of FileNode children
 */
export async function fetchFakeFiles(parentId: string): Promise<FileNode[]> {
  // Wait 1 second to simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const children: FileNode[] = [];

  // Root folder - "liable-owl"
  if (parentId === "root") {
    children.push(
      {
        id: "root-witty-pike",
        name: "witty-pike.png",
        type: "file",
        sizeKB: 30,
      },
      {
        id: "root-eldest-mink",
        name: "eldest-mink.jpg",
        type: "file",
        sizeKB: 26,
      },
      {
        id: "root-moaning-tapir",
        name: "moaning-tapir.doc",
        type: "file",
        sizeKB: 23,
      },
      {
        id: "root-artistic-harrier",
        name: "artistic-harrier.jpg",
        type: "file",
        sizeKB: 29,
      },
      {
        id: "root-integrated-bass",
        name: "integrated-bass.doc",
        type: "file",
        sizeKB: 29,
      },
      {
        id: "root-safe-ostrich",
        name: "safe-ostrich.png",
        type: "file",
        sizeKB: 7,
      },
      {
        id: "root-guilty-egret",
        name: "guilty-egret",
        type: "folder",
        loadChildren: () => fetchFakeFiles("root-guilty-egret"),
      }
    );
  }
  // "guilty-egret" folder
  else if (parentId === "root-guilty-egret") {
    children.push(
      {
        id: "guilty-egret-mysterious-goldfish",
        name: "mysterious-goldfish.doc",
        type: "file",
        sizeKB: 33,
      },
      {
        id: "guilty-egret-sick-dragonfly",
        name: "sick-dragonfly",
        type: "folder",
        loadChildren: () => fetchFakeFiles("guilty-egret-sick-dragonfly"),
      },
      {
        id: "guilty-egret-nutritious-marlin",
        name: "nutritious-marlin.doc",
        type: "file",
        sizeKB: 30,
      },
      {
        id: "guilty-egret-fortunate-felidae",
        name: "fortunate-felidae.jpg",
        type: "file",
        sizeKB: 9,
      }
    );
  }
  // For any other nested folders, generate random children
  else {
    const numChildren = Math.floor(Math.random() * 4) + 1;

    const fileNames = [
      "document.pdf",
      "image.png",
      "video.mp4",
      "script.js",
      "style.css",
      "readme.txt",
      "config.json",
      "data.csv",
    ];

    const folderNames = [
      "Documents",
      "Images",
      "Videos",
      "Projects",
      "Downloads",
    ];

    for (let i = 0; i < numChildren; i++) {
      const isFolder = Math.random() > 0.5;
      const name = isFolder
        ? folderNames[Math.floor(Math.random() * folderNames.length)]
        : fileNames[Math.floor(Math.random() * fileNames.length)];

      const child: FileNode = {
        id: `${parentId}-${i}`,
        name,
        type: isFolder ? "folder" : "file",
        ...(isFolder
          ? {
              loadChildren: () => fetchFakeFiles(`${parentId}-${i}`),
            }
          : {
              sizeKB: Math.floor(Math.random() * 5000) + 1,
            }),
      };

      children.push(child);
    }
  }

  return children;
}
