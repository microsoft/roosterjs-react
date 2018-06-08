import { getString as globalGetString, registerDefaultString, Strings } from 'roosterjs-react-common/lib';

const STRING_CATEGORY = 'ROOSTERJS_STRINGS_DIALOG';

export const dialogStrings = {
    // Dialogs:
    dlgOk: 'OK',
    dlgCancel: 'Cancel'
};

export type DialogStringKey = keyof typeof dialogStrings;

registerDefaultString(STRING_CATEGORY, dialogStrings);

export function getString(name: DialogStringKey, strings?: Strings): string {
    return globalGetString(STRING_CATEGORY, name, strings);
}

export { Strings };
