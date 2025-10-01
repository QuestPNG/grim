import { Box, Typography, Theme } from "@mui/material";
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ArticleIcon from '@mui/icons-material/Article';
import { useEffect, useState } from "react";
import { readDir, BaseDirectory, DirEntry } from "@tauri-apps/plugin-fs";
import { homeDir, configDir } from '@tauri-apps/api/path';
interface FileTreeProps {
  theme: Theme;
  onFileSelect?: (fileId: string, fileName: string) => void;
}

/*
 Tauri FS API object structure:
 {
  isDirectory:boolean;
  isFile:boolean;
  isSymlink:boolean;
  name:string;
 }
*/

export const convertTauriToTreeViewItems = (tauriObjects: DirEntry[], basePath: string = ''): TreeViewBaseItem[] => {
  return tauriObjects.map((entry) => {
    const fullPath = basePath ? `${basePath}/${entry.name}` : entry.name;
    
    const item: TreeViewBaseItem = {
      id: fullPath,
      label: entry.name,
    };

    if (entry.isDirectory) {
      // For directories, we'll add an empty children array
      // In a real implementation, you'd want to lazily load children
      item.children = [];
    }

    return item;
  });
};

export const convertTauriToTreeViewItemsRecursive = async (
  tauriObjects: DirEntry[], 
  basePath: string = '',
  baseDir?: BaseDirectory
): Promise<TreeViewBaseItem[]> => {
  const items: TreeViewBaseItem[] = [];
  
  for (const entry of tauriObjects) {
    const fullPath = basePath ? `${basePath}/${entry.name}` : entry.name;
    
    const item: TreeViewBaseItem = {
      id: fullPath,
      label: entry.name,
    };

    if (entry.isDirectory) {
      try {
        const childEntries = await readDir(fullPath, { baseDir });
        item.children = await convertTauriToTreeViewItemsRecursive(childEntries, fullPath, baseDir);
      } catch (error) {
        console.warn(`Could not read directory ${fullPath}:`, error);
        item.children = [];
      }
    }

    items.push(item);
  }
  
  return items;
};

export function FileTree({ theme, onFileSelect }: FileTreeProps) {
  const [treeData, setTreeData] = useState<TreeViewBaseItem[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const homeDirPath = await homeDir();
        console.log("Home directory path:", homeDirPath);
        const configDirPath = await configDir();
        const dir = await readDir('grim/notes', { baseDir: BaseDirectory.Config });
        console.log("Directory 'notes' exists:", dir);
        const treeItems = await convertTauriToTreeViewItemsRecursive(dir, 'grim/notes', BaseDirectory.Home);
        setTreeData(treeItems);
      } catch (error) {
        console.error("Error checking directory existence:", error);
      }
    };
    fetchFiles();
  }, [setTreeData]);
  const fileTreeItems: TreeViewBaseItem[] = [
    {
      id: 'notes',
      label: 'Notes',
      children: [
        {
          id: 'projects',
          label: 'Projects',
          children: [
            { id: 'grim.md', label: 'grim.md' },
            { id: 'todo.md', label: 'todo.md' },
          ],
        },
        {
          id: 'learning',
          label: 'Learning',
          children: [
            { id: 'rust.md', label: 'rust.md' },
            { id: 'react.md', label: 'react.md' },
            { id: 'algorithms.md', label: 'algorithms.md' },
          ],
        },
        {
          id: 'journal',
          label: 'Journal',
          children: [
            { id: '2024-01-15.md', label: '2024-01-15.md' },
            { id: '2024-01-16.md', label: '2024-01-16.md' },
          ],
        },
        { id: 'quick-notes.md', label: 'quick-notes.md' },
        { id: 'ideas.md', label: 'ideas.md' },
      ],
    },
  ];

  const handleItemSelectionToggle = (
    _event: React.SyntheticEvent | null,
    itemId: string,
    isSelected: boolean,
  ) => {
    if (isSelected && onFileSelect) {
      //const item = findItemById(fileTreeItems, itemId);
      const item = findItemById(treeData.length > 0 ? treeData : fileTreeItems, itemId);
      if (item && item.label.endsWith('.md')) {
        onFileSelect(itemId, item.label);
      }
    }
  };

  const findItemById = (items: TreeViewBaseItem[], id: string): TreeViewBaseItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Notes
      </Typography>
      <RichTreeView
        items={treeData.length > 0 ? treeData : fileTreeItems}
        onItemSelectionToggle={handleItemSelectionToggle}
        slots={{
          collapseIcon: FolderOpenIcon,
          expandIcon: FolderIcon,
          endIcon: ArticleIcon,
        }}
        sx={{
          '& .MuiTreeItem-content': {
            borderRadius: 1,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&.Mui-selected': {
              backgroundColor: theme.palette.primary.main + '20',
            },
          },
        }}
      />
    </Box>
  );
}
