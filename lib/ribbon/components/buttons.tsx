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

export const bold: RibbonButton = {
    title: 'Bold',
    buttonState: formatState =>
        formatState.isBold ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleBold(editor),
};
export const italic: RibbonButton = {
    title: 'Italic',
    buttonState: formatState =>
        formatState.isItalic ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleItalic(editor),
};
export const underline: RibbonButton = {
    title: 'Underline',
    buttonState: formatState =>
        formatState.isUnderline ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleUnderline(editor),
};
export const bullets: RibbonButton = {
    title: 'Bullets',
    buttonState: formatState =>
        formatState.isBullet ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleBullet(editor),
};
export const numbering: RibbonButton = {
    title: 'Numbering',
    buttonState: formatState =>
        formatState.isNumbering ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleNumbering(editor),
};
export const indent: RibbonButton = {
    title: 'Increase indent',
    onClick: editor => setIndentation(editor, Indentation.Increase),
};
export const outdent: RibbonButton = {
    title: 'Decrease indent',
    onClick: editor => setIndentation(editor, Indentation.Decrease),
};
export const blockquote: RibbonButton = {
    title: 'Quote',
    onClick: editor => toggleBlockQuote(editor),
    buttonState: formatState => formatState.isBlockQuote ? RibbonButtonState.Checked : RibbonButtonState.Normal,
};
export const alignleft: RibbonButton = {
    title: 'Align left',
    onClick: editor => setAlignment(editor, Alignment.Left),
};
export const aligncenter: RibbonButton = {
    title: 'Align center',
    onClick: editor => setAlignment(editor, Alignment.Center),
};
export const alignright: RibbonButton = {
    title: 'Align right',
    onClick: editor => setAlignment(editor, Alignment.Right),
};
export const unlink: RibbonButton = {
    title: 'Remove hyperlink',
    buttonState: formatState =>
        formatState.canUnlink ? RibbonButtonState.Normal : RibbonButtonState.Disabled,
    onClick: editor => removeLink(editor),
};
export const subscript: RibbonButton = {
    title: 'Subscript',
    buttonState: formatState =>
        formatState.isSubscript ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleSubscript(editor),
};
export const superscript: RibbonButton = {
    title: 'Superscript',
    buttonState: formatState =>
        formatState.isSuperscript ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleSuperscript(editor),
};
export const strikethrough: RibbonButton = {
    title: 'Strikethrough',
    buttonState: formatState =>
        formatState.isStrikeThrough ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleStrikethrough(editor),
};
export const ltr: RibbonButton = {
    title: 'Left-to-right',
    onClick: editor => setDirection(editor, Direction.LeftToRight),
};
export const rtl: RibbonButton = {
    title: 'Right-to-left',
    onClick: editor => setDirection(editor, Direction.RightToLeft),
};
export const undo: RibbonButton = {
    title: 'Undo',
    buttonState: formatState =>
        formatState.canUndo ? RibbonButtonState.Normal : RibbonButtonState.Disabled,
    onClick: editor => editor.undo(),
};
export const redo: RibbonButton = {
    title: 'Redo',
    buttonState: formatState =>
        formatState.canRedo ? RibbonButtonState.Normal : RibbonButtonState.Disabled,
    onClick: editor => editor.redo(),
};
export const removeformat: RibbonButton = {
    title: 'Remove formatting',
    onClick: editor => clearFormat(editor),
};
export const backcolor: RibbonButton = {
    title: 'Highlight',
    dropdown: (target, editor, dismiss, stringMap) =>
        <ColorPicker
            menuTargetElement={target}
            onDismissMenu={dismiss}
            colors={blackColors}
            stringMap={stringMap}
            onSelectColor={color => setBackgroundColor(editor, color.code)}
        />,
};
export const textcolor: RibbonButton = {
    title: 'Font color',
    dropdown: (target, editor, dismiss, stringMap) =>
        <ColorPicker
            menuTargetElement={target}
            onDismissMenu={dismiss}
            colors={textColors}
            stringMap={stringMap}
            onSelectColor={color => setTextColor(editor, color.code)}
        />,
};
export const createlink: RibbonButton = {
    title: 'Insert hyperlink',
    onClick: (editor, stringMap) => {
        editor.saveSelectionRange();
        let link = '';
        try {
            link = (queryNodesWithSelection(editor, 'a[href]')[0] as HTMLAnchorElement).href;
        } catch (e) {}

        confirm(
            stringMap['linkTitle'] || 'Insert link',
            stringMap['urlLabel'] || 'URL:',
            link,
            stringMap).then(link => {
                if (link) {
                    editor.focus();
                    createLink(editor, link, link);
                }
            });
        },
}
export const imagealttext: RibbonButton = {
    title: 'Insert alternate text',
    buttonState: formatState => formatState.canAddImageAltText ? RibbonButtonState.Normal : RibbonButtonState.Disabled,
    onClick: (editor, stringMap) => {
        editor.saveSelectionRange();
        let node = queryNodesWithSelection(editor, 'img')[0];
        let alt = (node as HTMLImageElement).alt;
        confirm(
            stringMap['altTextTitle'] || 'Insert alternate text',
            null,
            alt,
            stringMap).then(alt => {
                editor.focus();
                setImageAltText(editor, alt);
            });
        },
}
export const fontsize: RibbonButton = {
    title: 'Font size',
    dropdown: (target, editor, dismiss, stringFormat, format) =>
        <FontSizePicker
            menuTargetElement={target}
            onDismissMenu={dismiss}
            onSelectSize={fontSize => setFontSize(editor, fontSize + 'pt')}
            selectedSize={format.fontSize}
        />,
};
export const fontname: RibbonButton = {
    title: 'Font',
    dropdown: (target, editor, dismiss, stringMap, format) =>
        <FontNamePicker
            menuTargetElement={target}
            onDismissMenu={dismiss}
            onSelectName={font => setFontName(editor, font.family)}
            selectedName={format.fontName}
        />,
};
