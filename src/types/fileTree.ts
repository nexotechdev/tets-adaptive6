export type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: string; // Legacy support
  sizeKB?: number; // Size in kilobytes for files
  children?: FileNode[];
  loadChildren?: () => Promise<FileNode[]>;
};
