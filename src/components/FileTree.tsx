import { Box, Typography, Theme } from "@mui/material";
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ArticleIcon from '@mui/icons-material/Article';
import { useState } from "react";
import { readDir, BaseDirectory, DirEntry } from "@tauri-apps/plugin-fs";
interface FileTreeProps {
  viewRef: React.RefObject<any>;
  theme: Theme;
  onFileSelect?: (fileId: string, fileName: string) => void;
  treeRef?: React.RefObject<any>;
  treeItems: TreeViewBaseItem[];
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

export function FileTree({ viewRef, theme, onFileSelect, treeRef, treeItems }: FileTreeProps) {

  const [_, setIsFocused] = useState(false);


  const handleFocus = () => {
    console.log("TreeView focused");
    setIsFocused(true);
  };

  const handleBlur = () => {
    console.log("TreeView unfocused");
    setIsFocused(false);
  };
  /*useEffect(() => {
    const fetchFiles = async () => {
      try {
        const homeDirPath = await homeDir();
        console.log("Home directory path:", homeDirPath);
        const dir = await readDir('grim/notes', { baseDir: BaseDirectory.Config });
        console.log("Directory 'notes' exists:", dir);
        const treeItems = await convertTauriToTreeViewItemsRecursive(dir, 'grim/notes', BaseDirectory.Config);
        setTreeData(treeItems);
      } catch (error) {
        console.error("Error checking directory existence:", error);
      }
    };
    fetchFiles();
  }, [setTreeData]);*/
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
    console.log(`Item ${itemId} selection toggled. Selected: ${isSelected}`);
    if (isSelected && onFileSelect) {
      //const item = findItemById(fileTreeItems, itemId);
      const item = findItemById(treeItems.length > 0 ? treeItems : fileTreeItems, itemId);
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
        onItemFocus={handleFocus}
        onBlur={handleBlur}
        ref={viewRef}
        apiRef={treeRef}
        //items={treeData.length > 0 ? treeData : fileTreeItems}
        items={treeItems.length > 0 ? treeItems : fileTreeItems}
        onItemSelectionToggle={handleItemSelectionToggle}
        onItemClick={(event, itemId) => {
          console.log(`Item ${itemId} clicked.`);
          console.log("Event: ", event);
        }}
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

