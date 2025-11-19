import { useCallback } from 'react';
import { Button, useTheme } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { open } from '@tauri-apps/plugin-dialog';

interface DirectoryPickerProps {
  onDirectorySelected?: (directoryPath: string) => void;
  onError?: (error: string) => void;
  buttonText?: string;
  disabled?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
}

export function DirectoryPicker({
  onDirectorySelected,
  onError,
  buttonText = 'Select Directory',
  disabled = false,
  variant = 'contained',
  size = 'medium',
}: DirectoryPickerProps) {
  const theme = useTheme();

  const handleOpenDirectory = useCallback(async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Directory',
      });

      if (selected && typeof selected === 'string') {
        onDirectorySelected?.(selected);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to open directory picker';
      console.error('Directory picker error:', errorMessage);
      onError?.(errorMessage);
    }
  }, [onDirectorySelected, onError]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleOpenDirectory}
      disabled={disabled}
      startIcon={<FolderOpenIcon />}
      sx={{
        color: variant === 'contained' ? 'white' : theme.palette.primary.main,
        backgroundColor: variant === 'contained' ? theme.palette.primary.main : 'transparent',
        '&:hover': {
          backgroundColor: variant === 'contained' 
            ? theme.palette.primary.dark 
            : theme.palette.action.hover,
        },
        '&:disabled': {
          backgroundColor: variant === 'contained' 
            ? theme.palette.action.disabledBackground 
            : 'transparent',
          color: theme.palette.action.disabled,
        },
      }}
    >
      {buttonText}
    </Button>
  );
}