import { useCallback } from 'react';
import { Box, IconButton, Typography, useTheme, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { open } from '@tauri-apps/plugin-dialog';

interface ToolbarProps {
  title?: string;
  onDirectorySelected?: (directoryPath: string) => void;
}

export function Toolbar({ title = 'grimoire', onDirectorySelected }: ToolbarProps) {
  const theme = useTheme();

  const handleMinimize = useCallback(async () => {
    const appWindow = getCurrentWindow();
    await appWindow.minimize();
  }, []);

  const handleMaximize = useCallback(async () => {
    const appWindow = getCurrentWindow();
    const isMaximized = await appWindow.isMaximized();
    if (isMaximized) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
  }, []);

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
      console.error('Directory picker error:', error);
    }
  }, [onDirectorySelected]);

  // const barHeight = 32;
  const barHeight = 40;

  const handleClose = useCallback(async () => {
    console.log('Closing window');
    const appWindow = getCurrentWindow();
    await appWindow.close();
  }, []);

  return (
    <Box
      data-tauri-drag-region
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: barHeight,
        backgroundColor: theme.palette.background.paper,
        userSelect: 'none',
        position: 'relative',
        zIndex: 1000,
      }}
    >
      {/* File button - left side */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          position: 'absolute',
          left: 12,
          height: '100%',
        }}
      >
        <Button
          variant="text"
          size="small"
          onClick={handleOpenDirectory}
          startIcon={<FolderOpenIcon />}
          sx={{
            color: theme.palette.text.primary,
            textTransform: 'none',
            fontSize: '14px',
            minWidth: 'auto',
            padding: '4px 8px',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            pointerEvents: 'auto', // Ensure button is clickable despite drag region
          }}
        >
          File
        </Button>
      </Box>

      {/* App title - centered */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.primary,
            fontSize: '16px',
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Window controls - right side */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          position: 'absolute',
          right: 0,
          height: '100%',
        }}
      >
        <IconButton
          onClick={handleMinimize}
          size="small"
          sx={{
            width: 46,
            height: barHeight,
            borderRadius: 0,
            color: theme.palette.text.primary,
            background: theme.palette.background.default,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            boxShadow: 0,
          }}
        >
          <MinimizeIcon sx={{ fontSize: 16 }} />
        </IconButton>

        <IconButton
          onClick={handleMaximize}
          size="small"
          sx={{
            width: 46,
            height: barHeight,
            borderRadius: 0,
            color: theme.palette.text.primary,
            //background: theme.palette.background.default,
            background: theme.palette.background.default,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            boxShadow: 0,
          }}
        >
          <CropSquareIcon sx={{ fontSize: 14 }} />
        </IconButton>

        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            width: 46,
            height: barHeight,
            borderRadius: 0,
            color: theme.palette.text.primary,
            background: theme.palette.background.default,
            '&:hover': {
              //backgroundColor: '#ff5f56',
              backgroundColor: theme.palette.error.main,
              color: 'white',
            },
            boxShadow: 0,
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
