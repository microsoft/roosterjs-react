import {
    Strings,
    registerDefaultString,
    getString as globalGetString,
} from 'roosterjs-react-common';

const STRING_CATEGORY = 'ROOSTERJS_STRINGS_RIBBON';

export const ribbonButtonStrings = {
    // Ribbon buttons
    btnMore: 'More formatting options',
    btnFontName: 'Font',
    btnFontSize: 'Font size',
    btnBold: 'Bold',
    btnItalic: 'Italic',
    btnUnderline: 'Underline',
    btnBullets: 'Bullets',
    btnNumbering: 'Numbering',
    btnIndent: 'Increase indent',
    btnOutdent: 'Decrease indent',
    btnQuote: 'Quote',
    btnAlignLeft: 'Align left',
    btnAlignCenter: 'Align center',
    btnAlignRight: 'Align right',
    btnUnlink: 'Remove hyperlink',
    btnSubscript: 'Subscript',
    btnSuperScript: 'Superscript',
    btnStrikethrough: 'Strikethrough',
    btnLTR: 'Left-to-right',
    btnRTL: 'Right-to-left',
    btnUndo: 'Undo',
    btnRedo: 'Redo',
    btnUnformat: 'Remove formatting',
    btnBkColor: 'Highlight',
    btnFontColor: 'Font color',
    btnInsertLink: 'Insert hyperlink',
    btnImageAltText: 'Insert alternate text',
    dlgLinkTitle: 'Insert link',
    dlgUrlLabel: 'URL: ',
    dlgAltTextTitle: 'Insert alternate text',
};

export type RibbonButtonStringKey = (keyof typeof ribbonButtonStrings) | string;

registerDefaultString(STRING_CATEGORY, ribbonButtonStrings);

export function getString(name: RibbonButtonStringKey, strings?: Strings): string {
    return globalGetString(STRING_CATEGORY, name, strings);
}

export { Strings };
