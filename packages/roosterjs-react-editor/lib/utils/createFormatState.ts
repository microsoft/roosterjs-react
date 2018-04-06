import { FormatState } from 'roosterjs-editor-types';

export default function createFormatState(): FormatState {
    return {
        fontName: '',
        fontSize: '',
        isBold: false,
        isItalic: false,
        isUnderline: false,
        backgroundColor: '',
        textColor: '',
        isBullet: false,
        isNumbering: false,
        isStrikeThrough: false,
        isSubscript: false,
        isSuperscript: false,
        isBlockQuote: false,
        canUnlink: false,
        canAddImageAltText: false,
        canUndo: false,
        canRedo: false,
    };
}
