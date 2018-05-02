import * as React from 'react';
import { IContextualMenuItem, DirectionalHint } from 'office-ui-fabric-react/lib/ContextualMenu';
import { IIconProps } from 'office-ui-fabric-react/lib/Icon';
import {
    clearFormat,
    createLink,
    removeLink,
    setIndentation,
    setBackgroundColor,
    setTextColor,
    toggleBold,
    toggleBullet,
    toggleItalic,
    toggleNumbering,
    toggleStrikethrough,
    toggleUnderline,
    toggleHeader
} from 'roosterjs-editor-api';
import { Editor } from 'roosterjs-editor-core';
import { FormatState, Indentation } from 'roosterjs-editor-types';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { RoosterCommandBarProps, RoosterCommandBarState } from '../schema/RoosterCommandBarSchema';
import { ColorInfo, FontColorInfoList, HighlightColorInfoList } from './OutOfBoxCommandBarItem.ColorInfo';

export const RoosterCommandBarStringKeys = {
    LinkPrompt: "linkPrompt"
};

export interface OutOfBoxCommandBarItem extends ICommandBarItemProps {
    handleChange?: (editor: Editor, props: RoosterCommandBarProps, state: RoosterCommandBarState, strings?: { [key: string]: string }) => void;
    getSelected?: (formatState: FormatState) => boolean;
    getChecked?: (formatState: FormatState) => boolean;
}

export const OutOfBoxCommandBarItems: OutOfBoxCommandBarItem[] = [
    {
        key: "header",
        name: "Header",
        iconProps: _getIconProps("FontSize"),
        subMenuProps: {
            key: "header-sub",
            shouldFocusOnMount: true,
            directionalHint: DirectionalHint.bottomLeftEdge,
            items: [
                {
                    key: "header1",
                    name: "Header 1",
                    className: "rooster-command-bar-header1",
                    headerLevel: 1,
                    canCheck: true,
                    getChecked: _getCheckedForHeader,
                    handleChange: _handleChangeForHeader,
                    iconProps: null
                },
                {
                    key: "header2",
                    name: "Header 2",
                    className: "rooster-command-bar-header2",
                    headerLevel: 2,
                    canCheck: true,
                    getChecked: _getCheckedForHeader,
                    handleChange: _handleChangeForHeader,
                    iconProps: null
                },
                {
                    key: "header3",
                    name: "Header 3",
                    className: "rooster-command-bar-header3",
                    headerLevel: 3,
                    canCheck: true,
                    getChecked: _getCheckedForHeader,
                    handleChange: _handleChangeForHeader,
                    iconProps: null
                }
            ]
        }
    },
    {
        key: "bold",
        name: "Bold",
        iconProps: _getIconProps("Bold"),
        canCheck: true,
        getSelected: (formatState: FormatState) => formatState.isBold,
        handleChange: (editor: Editor) => toggleBold(editor)
    },
    {
        key: "italic",
        name: "Italic",
        iconProps: _getIconProps("Italic"),
        canCheck: true,
        getSelected: (formatState: FormatState) => formatState.isItalic,
        handleChange: (editor: Editor) => toggleItalic(editor)
    },
    {
        key: "underline",
        name: "Underline",
        iconProps: _getIconProps("Underline"),
        canCheck: true,
        getSelected: (formatState: FormatState) => formatState.isUnderline,
        handleChange: (editor: Editor) => toggleUnderline(editor)
    },
    {
        key: "bulleted-list",
        name: "Bulleted list",
        iconProps: _getIconProps("BulletedList"),
        canCheck: true,
        getSelected: (formatState: FormatState) => formatState.isBullet,
        handleChange: (editor: Editor) => toggleBullet(editor)
    },
    {
        key: "numbered-list",
        name: "Numbered list",
        iconProps: _getIconProps("NumberedList"),
        canCheck: true,
        getSelected: (formatState: FormatState) => formatState.isNumbering,
        handleChange: (editor: Editor) => toggleNumbering(editor)
    },
    {
        key: "link",
        name: "Link",
        iconProps: _getIconProps("Link"),
        getSelected: (formatState: FormatState) => formatState.isNumbering,
        handleChange: (editor: Editor, props: RoosterCommandBarProps, state: RoosterCommandBarState, strings?: { [key: string]: string }) => {
            let message = "Enter address";
            if (strings) {
                message = strings[RoosterCommandBarStringKeys.LinkPrompt] || message;
            }

            const link = prompt(message);
            if (link) {
                createLink(editor, link);
            }
        }
    },
    {
        key: "highlight",
        name: "Highlight",
        iconProps: _getIconProps("Highlight"),
        subMenuProps: {
            className: "rooster-command-bar-color-container",
            key: "highlight-sub",
            shouldFocusOnMount: true,
            directionalHint: DirectionalHint.bottomLeftEdge,
            focusZoneProps: { direction: FocusZoneDirection.bidirectional },
            items: HighlightColorInfoList.map((color: ColorInfo) => ({
                className: "rooster-command-bar-color-item",
                key: color.key,
                title: color.title,
                onRender: _colorCellOnRender,
                data: color,
                handleChange: _handleChangeForHighlight
            }) as IContextualMenuItem)
        }
    },
    {
        key: "clear-format",
        name: "Clear format",
        iconProps: _getIconProps("ClearFormatting"),
        handleChange: (editor: Editor) => clearFormat(editor)
    },
    {
        key: "emoji",
        name: "Emjoi",
        iconProps: _getIconProps("Emoji2"),
        handleChange: (editor: Editor, props: RoosterCommandBarProps) => {
            props.emojiPlugin.setIsSuggesting(true);
            editor.insertContent(':');
        }
    },
    {
        key: "photo",
        name: "Insert image",
        iconProps: _getIconProps("Photo2")
    },
    {
        key: "indent",
        name: "Increase indent",
        iconProps: _getIconProps("IncreaseIndentLegacy"),
        handleChange: (editor) => setIndentation(editor, Indentation.Increase)
    },
    {
        key: "outdent",
        name: "Decrease indent",
        iconProps: _getIconProps("DecreaseIndentLegacy"),
        handleChange: (editor) => setIndentation(editor, Indentation.Decrease)
    },
    {
        key: "strikethrough",
        name: "Strikethrough",
        iconProps: _getIconProps("Strikethrough"),
        getSelected: (formatState: FormatState) => formatState.isStrikeThrough,
        handleChange: (editor: Editor) => toggleStrikethrough(editor)
    },
    {
        key: "font-color",
        name: "Font color",
        iconProps: _getIconProps("FontColor"),
        subMenuProps: {
            className: "rooster-command-bar-color-container",
            key: "font-color-sub",
            shouldFocusOnMount: true,
            directionalHint: DirectionalHint.bottomLeftEdge,
            focusZoneProps: { direction: FocusZoneDirection.bidirectional },
            items: FontColorInfoList.map((color: ColorInfo) => ({
                className: "rooster-command-bar-color-item",
                key: color.key,
                title: color.title,
                onRender: _colorCellOnRender,
                data: color,
                handleChange: _handleChangeForFontColor
            }) as IContextualMenuItem)
        }
    },
    {
        key: "unlink",
        name: "Unlink",
        iconProps: _getIconProps("RemoveLink"),
        getDisabled: (formatState: FormatState) => !formatState.canUnlink,
        handleChange: (editor: Editor) => removeLink(editor)
    }
];

export const OutOfBoxCommandBarItemMap = OutOfBoxCommandBarItems.reduce(
    (result: { [key: string]: IContextualMenuItem }, item: IContextualMenuItem) => {
        result[item.key] = item;
        return result;
    },
    {} as { [key: string]: IContextualMenuItem });

function _getIconProps(name: string): IIconProps {
    return { className: `rooster-command-bar-icon ms-Icon ms-Icon--${name}` };
}

function _getCheckedForHeader(formatState: FormatState): boolean {
    return formatState.headerLevel === this.headerLevel;
}

function _handleChangeForHeader(editor: Editor, props: RoosterCommandBarProps, state: RoosterCommandBarState): void {
    if (state.formatState.headerLevel === this.headerLevel) {
        toggleHeader(editor, 0);
    } else {
        toggleHeader(editor, this.headerLevel);
    }
}

function _colorCellOnRender(item: IContextualMenuItem): JSX.Element {
    const { color, cellBorderColor } = item.data as ColorInfo;
    return (
        <DefaultButton title={item.title} key={item.key} onClick={(ev) => item.onClick(ev as React.MouseEvent<HTMLElement>, item)}>
            <div className="rooster-command-bar-color-cell" style={{ backgroundColor: color, borderColor: cellBorderColor }} />
        </DefaultButton>
    );
}

function _handleChangeForFontColor(editor: Editor): void {
    const { color } = this.data as ColorInfo;
    setTextColor(editor, color);
}

function _handleChangeForHighlight(editor: Editor): void {
    const { color } = this.data as ColorInfo;
    setBackgroundColor(editor, color);
}
