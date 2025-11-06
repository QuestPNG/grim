import { createTheme, Theme } from "@mui/material/styles";
import { CatppuccinFlavor, flavors } from "@catppuccin/palette";

declare module  '@mui/material/styles' {
    interface Theme {
        status: {
            danger: string;
        };

        custom: {
            background: {
                tertiary: string;
            }
        };
    }
    // allow configuration using `createTheme`
    interface ThemeOptions {
        status?: {
            danger?: string;
        };
        custom?: {
            background?: {
                tertiary?: string;
            }
        };
    }
}

export function getCatppuccinTheme(flavor: string): Theme  {
    let theme: CatppuccinFlavor;
    switch (flavor) {
        case "latte":
            theme = flavors.latte;
            break;
        case "frappe":
            theme = flavors.frappe;
            break;
        case "macchiato":
            theme = flavors.macchiato;
            break;
        case "mocha":
            theme = flavors.mocha;
            break;
        default:
            theme = flavors.frappe;
    }

    return createTheme({
        status: {
            danger: theme.colors.peach.hex,
        },
        custom: {
            background: {
                tertiary: theme.colors.crust.hex,
            }
        },
        palette: {
            primary: {
                main: theme.colors.blue.hex,
                contrastText: theme.colors.surface0.hex,
            },
            secondary: {
                main: theme.colors.mauve.hex,
            },
            background: {
                default: theme.colors.base.hex,
                paper: theme.colors.mantle.hex,
            },
            text: {
                primary: theme.colors.text.hex,
            },
            error: {
                main: theme.colors.red.hex,
            }
        }
    })
}
