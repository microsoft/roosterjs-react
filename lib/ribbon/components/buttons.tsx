import * as React from 'react';
import ColorPicker, { blackColors, textColors } from './pickers/ColorPicker';
import FontNamePicker from './pickers/FontNamePicker';
import FontSizePicker from './pickers/FontSizePicker';
import RibbonButton, { RibbonButtonState } from '../schema/RibbonButton';
import confirm from './dialog/ConfirmDialog';
import { Alignment, Indentation, Direction } from 'roosterjs-editor-types';
import {
    clearFormat,
    createLink,
    removeLink,
    queryNodesWithSelection,
    setAlignment,
    setBackgroundColor,
    setDirection,
    setFontName,
    setFontSize,
    setImageAltText,
    setIndentation,
    setTextColor,
    toggleBold,
    toggleBlockQuote,
    toggleBullet,
    toggleItalic,
    toggleNumbering,
    toggleStrikethrough,
    toggleSubscript,
    toggleSuperscript,
    toggleUnderline,
} from 'roosterjs-editor-api';
import { getString } from '../../strings/strings';

export const bold: RibbonButton = {
    name: 'btnBold',
    buttonState: formatState =>
        formatState.isBold ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleBold(editor),
};
export const italic: RibbonButton = {
    name: 'btnItalic',
    buttonState: formatState =>
        formatState.isItalic ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleItalic(editor),
};
export const underline: RibbonButton = {
    name: 'btnUnderline',
    buttonState: formatState =>
        formatState.isUnderline ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleUnderline(editor),
};
export const bullets: RibbonButton = {
    name: 'btnBullets',
    buttonState: formatState =>
        formatState.isBullet ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleBullet(editor),
};
export const numbering: RibbonButton = {
    name: 'btnNumbering',
    buttonState: formatState =>
        formatState.isNumbering ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleNumbering(editor),
};
export const indent: RibbonButton = {
    name: 'btnIndent',
    onClick: editor => setIndentation(editor, Indentation.Increase),
};
export const outdent: RibbonButton = {
    name: 'btnOutdent',
    onClick: editor => setIndentation(editor, Indentation.Decrease),
};
export const quote: RibbonButton = {
    name: 'btnQuote',
    onClick: editor => toggleBlockQuote(editor),
    buttonState: formatState => formatState.isBlockQuote ? RibbonButtonState.Checked : RibbonButtonState.Normal,
};
export const alignLeft: RibbonButton = {
    name: 'btnAlignLeft',
    onClick: editor => setAlignment(editor, Alignment.Left),
};
export const alignCenter: RibbonButton = {
    name: 'btnAlignCenter',
    onClick: editor => setAlignment(editor, Alignment.Center),
};
export const alignRight: RibbonButton = {
    name: 'btnAlignRight',
    onClick: editor => setAlignment(editor, Alignment.Right),
};
export const unlink: RibbonButton = {
    name: 'btnUnlink',
    buttonState: formatState =>
        formatState.canUnlink ? RibbonButtonState.Normal : RibbonButtonState.Disabled,
    onClick: editor => removeLink(editor),
};
export const subscript: RibbonButton = {
    name: 'btnSubscript',
    buttonState: formatState =>
        formatState.isSubscript ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleSubscript(editor),
};
export const superscript: RibbonButton = {
    name: 'btnSuperScript',
    buttonState: formatState =>
        formatState.isSuperscript ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleSuperscript(editor),
};
export const strikethrough: RibbonButton = {
    name: 'btnStrikethrough',
    buttonState: formatState =>
        formatState.isStrikeThrough ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleStrikethrough(editor),
};
export const ltr: RibbonButton = {
    name: 'btnLTR',
    onClick: editor => setDirection(editor, Direction.LeftToRight),
};
export const rtl: RibbonButton = {
    name: 'btnRTL',
    onClick: editor => setDirection(editor, Direction.RightToLeft),
};
export const undo: RibbonButton = {
    name: 'btnUndo',
    buttonState: formatState =>
        formatState.canUndo ? RibbonButtonState.Normal : RibbonButtonState.Disabled,
    onClick: editor => editor.undo(),
};
export const redo: RibbonButton = {
    name: 'btnRedo',
    buttonState: formatState =>
        formatState.canRedo ? RibbonButtonState.Normal : RibbonButtonState.Disabled,
    onClick: editor => editor.redo(),
};
export const removeformat: RibbonButton = {
    name: 'btnUnformat',
    onClick: editor => clearFormat(editor),
};
export const backColor: RibbonButton = {
    name: 'btnBkColor',
    dropdown: (target, editor, dismiss, strings) =>
        <ColorPicker
            menuTargetElement={target}
            onDismissMenu={dismiss}
            colors={blackColors}
            strings={strings}
            onSelectColor={color => setBackgroundColor(editor, color.code)}
        />,
};
export const textColor: RibbonButton = {
    name: 'btnFontColor',
    dropdown: (target, editor, dismiss, strings) =>
        <ColorPicker
            menuTargetElement={target}
            onDismissMenu={dismiss}
            colors={textColors}
            strings={strings}
            onSelectColor={color => setTextColor(editor, color.code)}
        />,
};
export const insertLink: RibbonButton = {
    name: 'btnInsertLink',
    onClick: (editor, strings) => {
        editor.saveSelectionRange();
        let link = '';
        try {
            link = (queryNodesWithSelection(editor, 'a[href]')[0] as HTMLAnchorElement).href;
        } catch (e) {}

        confirm(
            getString('dlgLinkTitle', strings),
            getString('dlgUrlLabel', strings),
            link,
            strings).then(link => {
                if (link) {
                    editor.focus();
                    createLink(editor, link, link);
                }
            });
        },
}
export const imageAltText: RibbonButton = {
    name: 'btnImageAltText',
    buttonState: formatState => formatState.canAddImageAltText ? RibbonButtonState.Normal : RibbonButtonState.Disabled,
    onClick: (editor, strings) => {
        editor.saveSelectionRange();
        let node = queryNodesWithSelection(editor, 'img')[0];
        let alt = (node as HTMLImageElement).alt;
        confirm(
            getString('dlgAltTextTitle', strings),
            null,
            alt,
            strings).then(alt => {
                editor.focus();
                setImageAltText(editor, alt);
            });
        },
}
export const fontSize: RibbonButton = {
    name: 'btnFontSize',
    dropdown: (target, editor, dismiss, stringFormat, format) =>
        <FontSizePicker
            menuTargetElement={target}
            onDismissMenu={dismiss}
            onSelectSize={fontSize => setFontSize(editor, fontSize + 'pt')}
            selectedSize={format.fontSize}
        />,
};
export const fontName: RibbonButton = {
    name: 'btnFontName',
    dropdown: (target, editor, dismiss, strings, format) =>
        <FontNamePicker
            menuTargetElement={target}
            onDismissMenu={dismiss}
            onSelectName={font => setFontName(editor, font.family)}
            selectedName={format.fontName}
        />,
};
