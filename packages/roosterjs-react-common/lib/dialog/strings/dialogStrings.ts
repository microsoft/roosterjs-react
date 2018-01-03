import {
    Strings,
    registerDefaultString,
    getString as globalGetString,
} from '../../strings/strings';

const STRING_CATEGORY = 'ROOSTERJS_STRINGS_DIALOG';

export const dialogStrings = {
    // Dialogs:
    dlgOk: 'OK',
    dlgCancel: 'Cancel',
};

export type DialogStringKey = keyof typeof dialogStrings;

registerDefaultString(STRING_CATEGORY, dialogStrings);

export function getString(name: DialogStringKey, strings?: Strings): string {
    return globalGetString(STRING_CATEGORY, name, strings);
}

export { Strings };
