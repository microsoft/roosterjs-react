import { Strings, registerDefaultString, getString as globalGetString } from 'roosterjs-react-strings';

const STRING_CATEGORY = 'ROOSTERJS_STRINGS_PICKERS';

export const colorStrings = {
    // Color names
    clrLightBlue: 'Light blue',
    clrLightGreen: 'Light green',
    clrLightYellow: 'Light yellow',
    clrLightOrange: 'Light orange',
    clrLightRed: 'Light red',
    clrLightPurple: 'Light purple',
    clrBlue: 'Blue',
    clrGreen: 'Green',
    clrYellow: 'Yellow',
    clrOrange: 'Orange',
    clrRed: 'Red',
    clrPurple: 'Purple',
    clrDarkBlue: 'Dark blue',
    clrDarkGreen: 'Dark green',
    clrDarkYellow: 'Dark yellow',
    clrDarkOrange: 'Dark orange',
    clrDarkRed: 'Dark red',
    clrDarkPurple: 'Dark purple',
    clrDarkerBlue: 'Darker blue',
    clrDarkerGreen: 'Darker green',
    clrDarkerYellow: 'Darker yellow',
    clrDarkerOrange: 'Darker orange',
    clrDarkerRed: 'Darker red',
    clrDarkerPurple: 'Darker purple',
    clrWhite: 'White',
    clrLightGray: 'Light gray',
    clrGray: 'Gray',
    clrDarkGray: 'Dark gray',
    clrDarkerGray: 'Darker gray',
    clrBlack: 'Black',
    clrCyan: 'Cyan',
    clrMagenta: 'Magenta',
    clrLightCyan: 'Light cyna',
    clrLightMagenta: 'Light magenta',
};

export type ColorStringKey = keyof typeof colorStrings;

registerDefaultString(STRING_CATEGORY, colorStrings);

export function getString(name: ColorStringKey, strings?: Strings): string {
    return globalGetString(STRING_CATEGORY, name, strings);
}

export { Strings };
