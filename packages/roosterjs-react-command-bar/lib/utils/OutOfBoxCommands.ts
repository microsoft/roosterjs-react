// TODO-1 import { ICommandBarItemProps } from '@uifabric/experiments/lib/CommandBar';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { IIconProps } from 'office-ui-fabric-react/lib/Icon';
import {
    clearFormat,
    removeLink,
    setAlignment,
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
import { Editor } from 'roosterjs-editor-core';
import { Alignment, FormatState, Indentation } from 'roosterjs-editor-types';

function getIconProps(name: string): IIconProps {
    return { className: `$rooster-command-bar-icon ms-Icon ms-Icon--${name}` };
}

export const OOB_COMMAND_BAR_ITEMS: IContextualMenuItem[] = [
    {
        key: "bold",
        iconProps: getIconProps("Bold"),
        getChecked: (formatState: FormatState) => formatState.isBold,
        handleChange: (editor: Editor) => toggleBold(editor)
    },
    {
        key: "italic",
        iconProps: getIconProps("Italic"),
        getChecked: (formatState: FormatState) => formatState.isItalic,
        handleChange: (editor: Editor) => toggleItalic(editor)
    },
    {
        key: "underline",
        iconProps: getIconProps("Underline"),
        getChecked: (formatState: FormatState) => formatState.isUnderline,
        handleChange: (editor: Editor) => toggleUnderline(editor)
    },
    {
        key: "strikethrough",
        iconProps: getIconProps("Strikethrough"),
        getChecked: (formatState: FormatState) => formatState.isStrikeThrough,
        handleChange: (editor: Editor) => toggleStrikethrough(editor)
    },
    {
        key: "bullets",
        iconProps: getIconProps("BulletedList"),
        getChecked: (formatState: FormatState) => formatState.isBullet,
        handleChange: (editor: Editor) => toggleBullet(editor)
    },
    {
        key: "numbering",
        iconProps: getIconProps("NumberedList"),
        getChecked: (formatState: FormatState) => formatState.isNumbering,
        handleChange: (editor: Editor) => toggleNumbering(editor)
    },
    {
        key: "indent",
        iconProps: getIconProps("IncreaseIndentLegacy"),
        handleChange: (editor) => setIndentation(editor, Indentation.Increase)
    },
    {
        key: "outdent",
        iconProps: getIconProps("DecreaseIndentLegacy"),
        handleChange: (editor) => setIndentation(editor, Indentation.Decrease)
    },
    {
        key: "align-left",
        iconProps: getIconProps("AlignLeft"),
        handleChange: (editor) => setAlignment(editor, Alignment.Left)
    },
    {
        key: "align-center",
        iconProps: getIconProps("AlignCenter"),
        handleChange: (editor) => setAlignment(editor, Alignment.Center)
    },
    {
        key: "align-right",
        iconProps: getIconProps("AlignRight"),
        handleChange: (editor) => setAlignment(editor, Alignment.Right)
    },
    {
        key: "unlink",
        iconProps: getIconProps("RemoveLink"),
        getDisabled: (formatState: FormatState) => !formatState.canUnlink,
        handleChange: (editor: Editor) => removeLink(editor)
    },
    {
        key: "subscript",
        iconProps: getIconProps("Subscript"),
        getChecked: (formatState: FormatState) => formatState.isSubscript,
        handleChange: (editor: Editor) => toggleSubscript(editor)
    },
    {
        key: "superscript",
        iconProps: getIconProps("Superscript"),
        getChecked: (formatState: FormatState) => formatState.isSuperscript,
        handleChange: (editor: Editor) => toggleSuperscript(editor)
    },
    {
        key: "undo",
        iconProps: getIconProps("Undo"),
        getDisabled: (formatState: FormatState) => !formatState.canUndo,
        handleChange: (editor: Editor) => editor.undo()
    },
    {
        key: "redo",
        iconProps: getIconProps("Redo"),
        getDisabled: (formatState: FormatState) => !formatState.canRedo,
        handleChange: (editor: Editor) => editor.redo()
    },
    {
        key: "clear-format",
        iconProps: getIconProps("ClearFormatting"),
        handleChange: (editor: Editor) => clearFormat(editor)
    }
];

type CommandBarItemMap = { [key: string]: IContextualMenuItem };
export const OOB_COMMAND_BAR_ITEM_MAP = OOB_COMMAND_BAR_ITEMS.reduce(
    (result: CommandBarItemMap, item: IContextualMenuItem) => {
        result[item.key] = item;
        return result;
    },
    {} as CommandBarItemMap);
