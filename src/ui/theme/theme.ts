import { createTheme, Theme } from "@mui/material/styles";
import { CatppuccinFlavor, flavors } from "@catppuccin/palette";

const frappe = flavors.frappe

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
            }
        }
    })
}
