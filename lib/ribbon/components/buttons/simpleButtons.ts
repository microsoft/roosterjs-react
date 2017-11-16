import RibbonButton, { RibbonButtonState } from '../../schema/RibbonButton';
import { Alignment, Indentation, Direction } from 'roosterjs-editor-types';
import {
    clearFormat,
    removeLink,
    setAlignment,
    setDirection,
    setIndentation,
    toggleBold,
    toggleBullet,
    toggleItalic,
    toggleNumbering,
    toggleStrikethrough,
    toggleSubscript,
    toggleSuperscript,
    toggleUnderline,
} from 'roosterjs-editor-api';

const BOLD_SVG = require('../../icons/bold.svg');
const ITALIC_SVG = require('../../icons/italic.svg');
const UNDERLINE_SVG = require('../../icons/underline.svg');
const BULLETS_SVG = require('../../icons/bullets.svg');
const BULLETS_RTL_SVG = require('../../icons/bullets-rtl.svg');
const NUMBERING_SVG = require('../../icons/numbering.svg');
const NUMBERING_RTL_SVG = require('../../icons/numbering-rtl.svg');
const OUTDENT_SVG = require('../../icons/outdent.svg');
const OUTDENT_RTL_SVG = require('../../icons/outdent-rtl.svg');
const INDENT_SVG = require('../../icons/indent.svg');
const INDENT_RTL_SVG = require('../../icons/indent-rtl.svg');
const ALIGNLEFT_SVG = require('../../icons/alignleft.svg');
const ALIGNCENTER_SVG = require('../../icons/aligncenter.svg');
const ALIGNRIGHT_SVG = require('../../icons/alignright.svg');
const UNLINK_SVG = require('../../icons/unlink.svg');
const SUPERSCRIPT_SVG = require('../../icons/superscript.svg');
const SUBSCRIPT_SVG = require('../../icons/subscript.svg');
const STRIKETHROUGH_SVG = require('../../icons/strikethrough.svg');
const LTR_SVG = require('../../icons/ltr.svg');
const RTL_SVG = require('../../icons/rtl.svg');
const UNDO_SVG = require('../../icons/undo.svg');
const REDO_SVG = require('../../icons/redo.svg');
const REMOVEFORMAT_SVG = require('../../icons/removeformat.svg');

export const bold: RibbonButton = {
    title: 'Bold',
    imageUrl: BOLD_SVG,
    buttonState: formatState =>
        formatState.isBold ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleBold(editor),
};
export const italic: RibbonButton = {
    title: 'Italic',
    imageUrl: ITALIC_SVG,
    buttonState: formatState =>
        formatState.isItalic ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleItalic(editor),
};
export const underline: RibbonButton = {
    title: 'Underline',
    imageUrl: UNDERLINE_SVG,
    buttonState: formatState =>
        formatState.isUnderline ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleUnderline(editor),
};
export const bullets: RibbonButton = {
    title: 'Bullets',
    imageUrl: BULLETS_SVG,
    rtlImageUrl: BULLETS_RTL_SVG,
    buttonState: formatState =>
        formatState.isBullet ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleBullet(editor),
};
export const numbering: RibbonButton = {
    title: 'Numbering',
    imageUrl: NUMBERING_SVG,
    rtlImageUrl: NUMBERING_RTL_SVG,
    buttonState: formatState =>
        formatState.isNumbering ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleNumbering(editor),
};
export const indent: RibbonButton = {
    title: 'Increase indent',
    imageUrl: INDENT_SVG,
    rtlImageUrl: INDENT_RTL_SVG,
    onClick: editor => setIndentation(editor, Indentation.Increase),
};
export const outdent: RibbonButton = {
    title: 'Decrease indent',
    imageUrl: OUTDENT_SVG,
    rtlImageUrl: OUTDENT_RTL_SVG,
    onClick: editor => setIndentation(editor, Indentation.Decrease),
};
export const alignleft: RibbonButton = {
    title: 'Align left',
    imageUrl: ALIGNLEFT_SVG,
    onClick: editor => setAlignment(editor, Alignment.Left),
};
export const aligncenter: RibbonButton = {
    title: 'Align center',
    imageUrl: ALIGNCENTER_SVG,
    onClick: editor => setAlignment(editor, Alignment.Center),
};
export const alignright: RibbonButton = {
    title: 'Align right',
    imageUrl: ALIGNRIGHT_SVG,
    onClick: editor => setAlignment(editor, Alignment.Right),
};
export const unlink: RibbonButton = {
    title: 'Remove hyperlink',
    imageUrl: UNLINK_SVG,
    buttonState: formatState =>
        formatState.canUnlink ? RibbonButtonState.Normal : RibbonButtonState.Disabled,
    onClick: editor => removeLink(editor),
};
export const subscript: RibbonButton = {
    title: 'Subscript',
    imageUrl: SUBSCRIPT_SVG,
    buttonState: formatState =>
        formatState.isSubscript ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleSubscript(editor),
};
export const superscript: RibbonButton = {
    title: 'Superscript',
    imageUrl: SUPERSCRIPT_SVG,
    buttonState: formatState =>
        formatState.isSuperscript ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleSuperscript(editor),
};
export const strikethrough: RibbonButton = {
    title: 'Strikethrough',
    imageUrl: STRIKETHROUGH_SVG,
    buttonState: formatState =>
        formatState.isStrikeThrough ? RibbonButtonState.Checked : RibbonButtonState.Normal,
    onClick: editor => toggleStrikethrough(editor),
};
export const ltr: RibbonButton = {
    title: 'Left-to-right',
    imageUrl: LTR_SVG,
    onClick: editor => setDirection(editor, Direction.LeftToRight),
};
export const rtl: RibbonButton = {
    title: 'Right-to-left',
    imageUrl: RTL_SVG,
    onClick: editor => setDirection(editor, Direction.RightToLeft),
};
export const undo: RibbonButton = {
    title: 'Undo',
    imageUrl: UNDO_SVG,
    buttonState: formatState =>
        formatState.canUndo ? RibbonButtonState.Normal : RibbonButtonState.Disabled,
    onClick: editor => editor.undo(),
};
export const redo: RibbonButton = {
    title: 'Redo',
    imageUrl: REDO_SVG,
    buttonState: formatState =>
        formatState.canRedo ? RibbonButtonState.Normal : RibbonButtonState.Disabled,
    onClick: editor => editor.redo(),
};
export const removeformat: RibbonButton = {
    title: 'Remove formatting',
    imageUrl: REMOVEFORMAT_SVG,
    onClick: editor => clearFormat(editor),
};
