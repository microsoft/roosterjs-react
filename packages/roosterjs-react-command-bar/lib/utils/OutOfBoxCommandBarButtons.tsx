import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { DirectionalHint, IContextualMenuItem } from "office-ui-fabric-react/lib/ContextualMenu";
import { FocusZoneDirection } from "office-ui-fabric-react/lib/FocusZone";
import { IIconProps } from "office-ui-fabric-react/lib/Icon";
import * as React from "react";
import {
    clearFormat,
    removeLink,
    setBackgroundColor,
    setIndentation,
    setTextColor,
    toggleBold,
    toggleBullet,
    toggleCodeBlock,
    toggleHeader,
    toggleItalic,
    toggleNumbering,
    toggleStrikethrough,
    toggleUnderline,
} from "roosterjs-editor-api";
import { Editor } from "roosterjs-editor-core";
import { FormatState, Indentation } from "roosterjs-editor-types";
import { setNonCompatIndentation, toggleNonCompatBullet, toggleNonCompatNumbering } from "roosterjs-react-common";

import {
    RoosterCommandBarButtonInternal,
    RoosterCommandBarProps,
    RoosterCommandBarState,
} from "../schema/RoosterCommandBarSchema";
import { getIconOnRenderDelegate } from "./getIconOnRenderDelegate";
import { ColorInfo, FontColorInfoList, HighlightColorInfoList } from "./OutOfBoxCommandBarButtons.ColorInfo";

export const RoosterCommandBarIconClassName = "rooster-command-bar-icon";
export const RoosterCommandBarButtonClassName = "rooster-command-bar-button";

export const RoosterCommandBarStringKeys = {
    LinkPrompt: "linkPrompt"
};

export const RoosterCommmandBarButtonKeys = {
    Header: "header",
    Bold: "bold",
    Italic: "italic",
    Underline: "underline",
    BulletedList: "bulleted-list",
    NumberedList: "numbered-list",
    Link: "link",
    Highlight: "highlight",
    ClearFormat: "clear-format",
    Emoji: "emoji",
    InsertImage: "insert-image",
    Indent: "indent",
    Outdent: "outdent",
    Strikethrough: "strikethrough",
    FontColor: "font-color",
    Unlink: "unlink",
    Code: "code"
};

export const OutOfBoxCommandBarButtons: RoosterCommandBarButtonInternal[] = [
    {
        key: RoosterCommmandBarButtonKeys.Bold,
        name: "Bold",
        iconProps: _getIconProps("Bold"),
        canCheck: true,
        getChecked: (formatState: FormatState) => formatState.isBold,
        handleChange: (editor: Editor) => toggleBold(editor)
    },
    {
        key: RoosterCommmandBarButtonKeys.Italic,
        name: "Italic",
        iconProps: _getIconProps("Italic"),
        canCheck: true,
        getChecked: (formatState: FormatState) => formatState.isItalic,
        handleChange: (editor: Editor) => toggleItalic(editor)
    },
    {
        key: RoosterCommmandBarButtonKeys.Underline,
        name: "Underline",
        iconProps: _getIconProps("Underline"),
        canCheck: true,
        getChecked: (formatState: FormatState) => formatState.isUnderline,
        handleChange: (editor: Editor) => toggleUnderline(editor)
    },
    {
        key: RoosterCommmandBarButtonKeys.BulletedList,
        name: "Bulleted list",
        iconProps: _getIconProps("BulletedList"),
        onRender: getIconOnRenderDelegate("BulletedList", { name: "BulletedListText" }, { name: "BulletedListBullet" }),
        canCheck: true,
        getChecked: (formatState: FormatState) => formatState.isBullet,
        handleChange: (editor: Editor, props: RoosterCommandBarProps) => (props.disableListWorkaround ? toggleNonCompatBullet : toggleBullet)(editor)
    },
    {
        key: RoosterCommmandBarButtonKeys.NumberedList,
        name: "Numbered list",
        iconProps: _getIconProps("NumberedList"),
        onRender: getIconOnRenderDelegate("NumberedList", { name: "NumberedListText" }, { name: "NumberedListNumber" }),
        canCheck: true,
        getChecked: (formatState: FormatState) => formatState.isNumbering,
        handleChange: (editor: Editor, props: RoosterCommandBarProps) => (props.disableListWorkaround ? toggleNonCompatNumbering : toggleNumbering)(editor)
    },
    {
        key: RoosterCommmandBarButtonKeys.Highlight,
        name: "Highlight",
        iconProps: _getIconProps("Highlight"),
        onRenderParams: ["FabricTextHighlightComposite", { name: "FontColorSwatch", className: "highlight-swatch" }, { name: "FabricTextHighlight" }],
        subMenuProps: {
            className: "rooster-command-bar-color-container",
            shouldFocusOnMount: true,
            directionalHint: DirectionalHint.bottomLeftEdge,
            focusZoneProps: { direction: FocusZoneDirection.bidirectional },
            items: HighlightColorInfoList.map(
                (color: ColorInfo) =>
                    ({
                        className: "rooster-command-bar-color-item",
                        key: color.key,
                        title: color.title,
                        onRender: _colorCellOnRender,
                        data: color,
                        handleChange: _handleChangeForHighlight
                    } as IContextualMenuItem)
            )
        }
    },
    {
        key: RoosterCommmandBarButtonKeys.FontColor,
        name: "Font color",
        iconProps: _getIconProps("FontColor"),
        onRenderParams: ["FontColor", { name: "FontColorSwatch", className: "color-swatch" }, { name: "FontColorA" }],
        subMenuProps: {
            className: "rooster-command-bar-color-container",
            shouldFocusOnMount: true,
            directionalHint: DirectionalHint.bottomLeftEdge,
            focusZoneProps: { direction: FocusZoneDirection.bidirectional },
            items: FontColorInfoList.map(
                (color: ColorInfo) =>
                    ({
                        className: "rooster-command-bar-color-item",
                        key: color.key,
                        title: color.title,
                        onRender: _colorCellOnRender,
                        data: color,
                        handleChange: _handleChangeForFontColor
                    } as IContextualMenuItem)
            )
        }
    },
    {
        key: RoosterCommmandBarButtonKeys.Emoji,
        name: "Emoji",
        iconProps: { className: `${RoosterCommandBarIconClassName} rooster-emoji` } as IIconProps,
        handleChange: (editor: Editor, props: RoosterCommandBarProps) => props.emojiPlugin.startEmoji()
    },
    {
        key: RoosterCommmandBarButtonKeys.Outdent,
        name: "Decrease indent",
        iconProps: _getIconProps("DecreaseIndentLegacy"),
        onRender: getIconOnRenderDelegate("DecreaseIndentLegacy", { name: "DecreaseIndentText" }, { name: "DecreaseIndentArrow" }),
        handleChange: (editor: Editor, props: RoosterCommandBarProps) => (props.disableListWorkaround ? setNonCompatIndentation : setIndentation)(editor, Indentation.Decrease)
    },
    {
        key: RoosterCommmandBarButtonKeys.Indent,
        name: "Increase indent",
        iconProps: _getIconProps("IncreaseIndentLegacy"),
        onRender: getIconOnRenderDelegate("IncreaseIndentLegacy", { name: "IncreaseIndentText" }, { name: "IncreaseIndentArrow" }),
        handleChange: (editor: Editor, props: RoosterCommandBarProps) => (props.disableListWorkaround ? setNonCompatIndentation : setIndentation)(editor, Indentation.Increase)
    },
    {
        key: RoosterCommmandBarButtonKeys.Strikethrough,
        name: "Strikethrough",
        iconProps: _getIconProps("Strikethrough"),
        getChecked: (formatState: FormatState) => formatState.isStrikeThrough,
        handleChange: (editor: Editor) => toggleStrikethrough(editor)
    },
    {
        key: RoosterCommmandBarButtonKeys.Header,
        name: "Header",
        iconProps: _getIconProps("FontSize"),
        onRenderParams: [null, { name: "FontSize" }],
        subMenuProps: {
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
                    isContextMenuItem: true,
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
                    isContextMenuItem: true,
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
                    isContextMenuItem: true,
                    handleChange: _handleChangeForHeader,
                    iconProps: null
                }
            ] as RoosterCommandBarButtonInternal[]
        }
    },
    {
        key: RoosterCommmandBarButtonKeys.Code,
        name: "Code",
        iconProps: _getIconProps("Embed"),
        handleChange: (editor: Editor) => toggleCodeBlock(editor)
    },
    {
        key: RoosterCommmandBarButtonKeys.ClearFormat,
        name: "Clear format",
        iconProps: _getIconProps("ClearFormatting"),
        onRender: getIconOnRenderDelegate("ClearFormatting", { name: "ClearFormattingA" }, { name: "ClearFormattingEraser" }),
        handleChange: (editor: Editor) => {
            editor.addUndoSnapshot(() => {
                clearFormat(editor);
                toggleHeader(editor, 0);
            });
        }
    },
    {
        key: RoosterCommmandBarButtonKeys.InsertImage,
        name: "Insert image",
        iconProps: _getIconProps("Photo2"),
        onRender: getIconOnRenderDelegate(null, { name: "Photo2Fill" }, { name: "Photo2" }) // reuse Photo2 as the high contrast icon
    },
    {
        key: RoosterCommmandBarButtonKeys.Link,
        name: "Link",
        iconProps: _getIconProps("Link"),
        handleChange: (editor: Editor, props: RoosterCommandBarProps) => props.roosterCommandBarPlugin.promptForLink()
    },
    {
        key: RoosterCommmandBarButtonKeys.Unlink,
        name: "Unlink",
        iconProps: _getIconProps("RemoveLink"),
        onRender: getIconOnRenderDelegate("RemoveLink", { name: "RemoveLinkChain" }, { name: "RemoveLinkX" }),
        getDisabled: (formatState: FormatState) => !formatState.canUnlink,
        handleChange: (editor: Editor) => removeLink(editor)
    }
];
OutOfBoxCommandBarButtons.forEach((button: RoosterCommandBarButtonInternal) => {
    const asset = { name: button.name };
    if (!button.onRenderParams) {
        button.onRender = button.onRender || getIconOnRenderDelegate(null, asset);
    }
});

export const OutOfBoxCommandBarButtonMap = OutOfBoxCommandBarButtons.reduce(
    (result: { [key: string]: RoosterCommandBarButtonInternal }, item: RoosterCommandBarButtonInternal) => {
        result[item.key] = item;
        return result;
    },
    {} as { [key: string]: RoosterCommandBarButtonInternal }
);

function _getIconProps(iconName: string): IIconProps {
    return { className: RoosterCommandBarIconClassName, iconName };
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
        <DefaultButton className="rooster-command-bar-color-button" title={item.title} key={item.key} onClick={ev => item.onClick(ev as React.MouseEvent<HTMLElement>, item)}>
            {cellBorderColor && <div className="rooster-command-bar-color-cell-border" style={{ borderColor: cellBorderColor }} />}
            <svg className="rooster-command-bar-color-cell" viewBox="0 0 30 30" fill={color} focusable="false">
                <rect width="100%" height="100%" />
            </svg>
        </DefaultButton>
    );
}

function _handleChangeForFontColor(editor: Editor): void {
    const { color } = this.data as ColorInfo;
    setTextColor(editor, color);
}

function _handleChangeForHighlight(editor: Editor): void {
    const { color } = this.data as ColorInfo;
    const selection = editor.getSelection();
    let backwards = false;
    if (!selection.isCollapsed) {
        const range = editor.getDocument().createRange();
        range.setStart(selection.anchorNode, selection.anchorOffset);
        range.setEnd(selection.focusNode, selection.focusOffset);
        backwards = range.collapsed;
    }

    setBackgroundColor(editor, color);
    if (backwards) {
        selection.collapseToStart();
    } else {
        selection.collapseToEnd();
    }
}
