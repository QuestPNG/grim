import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { flavors } from '@catppuccin/palette';

interface ThemeColorDisplayProps {
  flavor?: string;
}

interface ColorSwatchProps {
  name: string;
  color: string;
  textColor?: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ name, color, textColor = '#000' }) => (
  <Paper
    elevation={2}
    sx={{
      backgroundColor: color,
      padding: 2,
      margin: 1,
      minHeight: 80,
      minWidth: 200,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      border: 1,
      borderColor: 'grey.300'
    }}
  >
    <Typography
      variant="body2"
      sx={{
        color: textColor,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
      }}
    >
      {name}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        color: textColor,
        textAlign: 'center',
        fontFamily: 'monospace',
        fontSize: '0.7rem',
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
      }}
    >
      {color}
    </Typography>
  </Paper>
);

export const ThemeColorDisplay: React.FC<ThemeColorDisplayProps> = ({ flavor = 'frappe' }) => {
  const theme = useTheme();
  
  // Get the current Catppuccin flavor
  const catppuccinTheme = flavor === 'latte' ? flavors.latte :
                         flavor === 'frappe' ? flavors.frappe :
                         flavor === 'macchiato' ? flavors.macchiato :
                         flavor === 'mocha' ? flavors.mocha :
                         flavors.frappe;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Theme Color Display - {flavor.charAt(0).toUpperCase() + flavor.slice(1)}
      </Typography>
      
      {/* Material UI Palette Colors */}
      <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
        Material UI Palette Colors
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <ColorSwatch 
          name="Primary Main" 
          color={theme.palette.primary.main}
          textColor={theme.palette.primary.contrastText}
        />
        <ColorSwatch 
          name="Secondary Main" 
          color={theme.palette.secondary.main}
          textColor={theme.palette.getContrastText(theme.palette.secondary.main)}
        />
        <ColorSwatch 
          name="Background Default" 
          color={theme.palette.background.default}
          textColor={theme.palette.text.primary}
        />
        <ColorSwatch 
          name="Background Paper" 
          color={theme.palette.background.paper}
          textColor={theme.palette.text.primary}
        />
        <ColorSwatch 
          name="Text Primary" 
          color={theme.palette.text.primary}
          textColor={theme.palette.background.default}
        />
        {theme.palette.text.secondary && (
          <ColorSwatch 
            name="Text Secondary" 
            color={theme.palette.text.secondary}
            textColor={theme.palette.background.default}
          />
        )}
      </Box>

      {/* Full Catppuccin Color Palette */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Full Catppuccin Color Palette
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {Object.entries(catppuccinTheme.colors).map(([colorName, colorValue]) => (
          <ColorSwatch 
            key={colorName}
            name={colorName.charAt(0).toUpperCase() + colorName.slice(1)}
            color={colorValue.hex}
            textColor={colorValue.hsl.l > 50 ? '#000000' : '#ffffff'}
          />
        ))}
      </Box>

      {/* Color Categories */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Catppuccin Color Categories
      </Typography>
      
      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
        Base Colors
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {['base', 'mantle', 'crust'].map((colorName) => {
          const color = (catppuccinTheme.colors as any)[colorName];
          return color ? (
            <ColorSwatch 
              key={colorName}
              name={colorName.charAt(0).toUpperCase() + colorName.slice(1)}
              color={color.hex}
              textColor={catppuccinTheme.colors.text.hex}
            />
          ) : null;
        })}
      </Box>

      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
        Surface Colors
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {['surface0', 'surface1', 'surface2'].map((colorName) => {
          const color = (catppuccinTheme.colors as any)[colorName];
          return color ? (
            <ColorSwatch 
              key={colorName}
              name={colorName.charAt(0).toUpperCase() + colorName.slice(1)}
              color={color.hex}
              textColor={catppuccinTheme.colors.text.hex}
            />
          ) : null;
        })}
      </Box>

      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
        Accent Colors
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {['red', 'maroon', 'peach', 'yellow', 'green', 'teal', 'sky', 'sapphire', 'blue', 'lavender', 'mauve', 'pink', 'flamingo', 'rosewater'].map((colorName) => {
          const color = (catppuccinTheme.colors as any)[colorName];
          return color ? (
            <ColorSwatch 
              key={colorName}
              name={colorName.charAt(0).toUpperCase() + colorName.slice(1)}
              color={color.hex}
              textColor={color.hsl.l > 50 ? '#000000' : '#ffffff'}
            />
          ) : null;
        })}
      </Box>

      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
        Text Colors
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {['text', 'subtext1', 'subtext0', 'overlay2', 'overlay1', 'overlay0'].map((colorName) => {
          const color = (catppuccinTheme.colors as any)[colorName];
          return color ? (
            <ColorSwatch 
              key={colorName}
              name={colorName.charAt(0).toUpperCase() + colorName.slice(1)}
              color={color.hex}
              textColor={catppuccinTheme.colors.base.hex}
            />
          ) : null;
        })}
      </Box>
    </Box>
  );
};