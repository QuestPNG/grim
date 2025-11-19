import { Box, Typography, Theme } from "@mui/material";
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ArticleIcon from '@mui/icons-material/Article';
import { useState, useCallback } from "react";
import { readDir, BaseDirectory, DirEntry } from "@tauri-apps/plugin-fs";
interface FileTreeProps {
  viewRef: React.RefObject<any>;
  theme: Theme;
  onFileSelect?: (fileId: string, fileName: string) => void;
  treeRef?: React.RefObject<any>;
  treeItems: TreeViewBaseItem[];
  expandedItems?: string[];
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

/**
 * Gets all visible (navigable) items in the tree, considering only expanded nodes
 */
const getVisibleItems = (items: TreeViewBaseItem[], expandedItems: Set<string> = new Set(), path: TreeViewBaseItem[] = []): TreeViewBaseItem[] => {
  const visibleItems: TreeViewBaseItem[] = [];
  
  for (const item of items) {
    // Add current item to visible list
    visibleItems.push(item);
    
    // If item has children and is expanded, recursively get visible children
    if (item.children && item.children.length > 0 && expandedItems.has(item.id as string)) {
      const childrenVisible = getVisibleItems(item.children, expandedItems, [...path, item]);
      visibleItems.push(...childrenVisible);
    }
  }
  
  return visibleItems;
};

/**
 * Focuses the next visible item in the tree
 */
export const focusNextItem = (
  currentItemId: string | null, 
  treeItems: TreeViewBaseItem[], 
  expandedItems: Set<string>,
  treeRef: React.RefObject<any>
): string | null => {
  const visibleItems = getVisibleItems(treeItems, expandedItems);
  
  if (visibleItems.length === 0) return null;
  
  if (!currentItemId) {
    // If no current item, focus the first item
    const firstItem = visibleItems[0];
    treeRef.current?.focusItem(null, firstItem.id);
    return firstItem.id as string;
  }
  
  const currentIndex = visibleItems.findIndex(item => item.id === currentItemId);
  
  if (currentIndex === -1 || currentIndex === visibleItems.length - 1) {
    // If current item not found or is last item, wrap to first
    const firstItem = visibleItems[0];
    treeRef.current?.focusItem(null, firstItem.id);
    return firstItem.id as string;
  }
  
  const nextItem = visibleItems[currentIndex + 1];
  treeRef.current?.focusItem(null, nextItem.id);
  return nextItem.id as string;
};

/**
 * Focuses the previous visible item in the tree
 */
export const focusPreviousItem = (
  currentItemId: string | null, 
  treeItems: TreeViewBaseItem[], 
  expandedItems: Set<string>,
  treeRef: React.RefObject<any>
): string | null => {
  const visibleItems = getVisibleItems(treeItems, expandedItems);
  
  if (visibleItems.length === 0) return null;
  
  if (!currentItemId) {
    // If no current item, focus the last item
    const lastItem = visibleItems[visibleItems.length - 1];
    treeRef.current?.focusItem(null, lastItem.id);
    return lastItem.id as string;
  }
  
  const currentIndex = visibleItems.findIndex(item => item.id === currentItemId);
  
  if (currentIndex === -1 || currentIndex === 0) {
    // If current item not found or is first item, wrap to last
    const lastItem = visibleItems[visibleItems.length - 1];
    treeRef.current?.focusItem(null, lastItem.id);
    return lastItem.id as string;
  }
  
  const previousItem = visibleItems[currentIndex - 1];
  treeRef.current?.focusItem(null, previousItem.id);
  return previousItem.id as string;
};

export function FileTree({ viewRef, theme, onFileSelect, treeRef, treeItems, expandedItems = [] }: FileTreeProps) {

  const [_, setIsFocused] = useState(false);
  const [currentFocusedItem, setCurrentFocusedItem] = useState<string | null>(null);
  const [internalExpandedItems, setInternalExpandedItems] = useState<string[]>(expandedItems);
  
  // Convert expanded items array to Set for efficient lookup
  const expandedSet = new Set(internalExpandedItems);

  // Navigation functions for external use
  const handleFocusNext = useCallback(() => {
    if (!treeRef?.current) return null;
    
    const items = treeItems.length > 0 ? treeItems : fileTreeItems;
    const nextId = focusNextItem(currentFocusedItem, items, expandedSet, treeRef);
    if (nextId) {
      setCurrentFocusedItem(nextId);
    }
    return nextId;
  }, [currentFocusedItem, treeItems, expandedSet, treeRef]);

  const handleFocusPrevious = useCallback(() => {
    if (!treeRef?.current) return null;
    
    const items = treeItems.length > 0 ? treeItems : fileTreeItems;
    const prevId = focusPreviousItem(currentFocusedItem, items, expandedSet, treeRef);
    if (prevId) {
      setCurrentFocusedItem(prevId);
    }
    return prevId;
  }, [currentFocusedItem, treeItems, expandedSet, treeRef]);

  // Expose navigation functions via ref
  if (treeRef?.current) {
    treeRef.current.focusNext = handleFocusNext;
    treeRef.current.focusPrevious = handleFocusPrevious;
  }


  const handleBlur = () => {
    console.log("TreeView unfocused");
    setIsFocused(false);
  };

  const handleItemFocus = useCallback((_event: React.SyntheticEvent | null, itemId: string) => {
    console.log(`Item ${itemId} focused`);
    setCurrentFocusedItem(itemId);
  }, []);

  const handleExpandedItemsChange = useCallback((_event: React.SyntheticEvent | null, itemIds: string[]) => {
    console.log('Expanded items changed:', itemIds);
    setInternalExpandedItems(itemIds);
  }, []);
  /*useEffect(() => {
    const fetchFiles = async () => {
      try {
        const homeDirPath = await homeDir();
        console.log("Home directory path:", homeDirPath);
        // Use dynamic path instead of hardcoded
        const notesPath = 'grim/notes'; // This would come from config
        const dir = await readDir(notesPath, { baseDir: BaseDirectory.Config });
        console.log("Directory 'notes' exists:", dir);
        const treeItems = await convertTauriToTreeViewItemsRecursive(dir, notesPath, BaseDirectory.Config);
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
        onItemFocus={handleItemFocus}
        onBlur={handleBlur}
        onExpandedItemsChange={handleExpandedItemsChange}
        expandedItems={internalExpandedItems}
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
            paddingRight: 10,
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

