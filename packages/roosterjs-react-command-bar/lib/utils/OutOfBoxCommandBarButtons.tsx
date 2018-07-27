import { CommandBarButton, DefaultButton, IButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';
import { DirectionalHint, IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { Icon, IIconProps } from 'office-ui-fabric-react/lib/Icon';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';
import * as React from 'react';
import {
    clearFormat,
    removeLink,
    setBackgroundColor,
    setIndentation,
    setTextColor,
    toggleBold,
    toggleBullet,
    toggleHeader,
    toggleItalic,
    toggleNumbering,
    toggleStrikethrough,
    toggleUnderline
} from 'roosterjs-editor-api';
import { Editor } from 'roosterjs-editor-core';
import { FormatState, Indentation } from 'roosterjs-editor-types';
import { createLinkWithPrompt, css, setNonCompatIndentation, toggleNonCompatBullet, toggleNonCompatNumbering } from 'roosterjs-react-common';

import { RoosterCommandBarButton, RoosterCommandBarProps, RoosterCommandBarState } from '../schema/RoosterCommandBarSchema';
import { ColorInfo, FontColorInfoList, HighlightColorInfoList } from './OutOfBoxCommandBarButtons.ColorInfo';

type ButtonOnRenderDelegate = (item: IContextualMenuItem) => JSX.Element;
const OnRenderDelegateCache: { [key: string]: ButtonOnRenderDelegate } = {};

export const RoosterCommandBarIconClassName = 'rooster-command-bar-icon';

export const RoosterCommandBarButtonRootClassName = 'rooster-command-button-root';

export const RoosterCommandBarStringKeys = {
    LinkPrompt: 'linkPrompt'
};

export const RoosterCommmandBarButtonKeys = {
    Header: 'header',
    Bold: 'bold',
    Italic: 'italic',
    Underline: 'underline',
    BulletedList: 'bulleted-list',
    NumberedList: 'numbered-list',
    Link: 'link',
    Highlight: 'highlight',
    ClearFormat: 'clear-format',
    Emoji: 'emoji',
    InsertImage: 'insert-image',
    Indent: 'indent',
    Outdent: 'outdent',
    Strikethrough: 'strikethrough',
    FontColor: 'font-color',
    Unlink: 'unlink'
};

export const OutOfBoxCommandBarButtons: RoosterCommandBarButton[] = [
    {
        key: RoosterCommmandBarButtonKeys.Bold,
        name: 'Bold',
        iconProps: _getIconProps('Bold'),
        canCheck: true,
        getChecked: (formatState: FormatState) => formatState.isBold,
        handleChange: (editor: Editor) => toggleBold(editor)
    },
    {
        key: RoosterCommmandBarButtonKeys.Italic,
        name: 'Italic',
        iconProps: _getIconProps('Italic'),
        canCheck: true,
        getChecked: (formatState: FormatState) => formatState.isItalic,
        handleChange: (editor: Editor) => toggleItalic(editor)
    },
    {
        key: RoosterCommmandBarButtonKeys.Underline,
        name: 'Underline',
        iconProps: _getIconProps('Underline'),
        canCheck: true,
        getChecked: (formatState: FormatState) => formatState.isUnderline,
        handleChange: (editor: Editor) => toggleUnderline(editor)
    },
    {
        key: RoosterCommmandBarButtonKeys.BulletedList,
        name: 'Bulleted list',
        iconProps: _getIconProps('BulletedList'),
        onRender: _getIconOnRenderDelegate({ name: "BulletedListText" }, { name: "BulletedListBullet" }, "BulletedList"),
        canCheck: true,
        getChecked: (formatState: FormatState) => formatState.isBullet,
        handleChange: (editor: Editor, props: RoosterCommandBarProps) => (props.disableListWorkaround ? toggleNonCompatBullet : toggleBullet)(editor)
    },
    {
        key: RoosterCommmandBarButtonKeys.NumberedList,
        name: 'Numbered list',
        iconProps: _getIconProps('NumberedList'),
        onRender: _getIconOnRenderDelegate({ name: "NumberedListText" }, { name: "NumberedListNumber" }, "NumberedList"),
        canCheck: true,
        getChecked: (formatState: FormatState) => formatState.isNumbering,
        handleChange: (editor: Editor, props: RoosterCommandBarProps) => (props.disableListWorkaround ? toggleNonCompatNumbering : toggleNumbering)(editor)
    },
    {
        key: RoosterCommmandBarButtonKeys.Highlight,
        name: 'Highlight',
        iconProps: _getIconProps('Highlight'),
        onRender: _getIconOnRenderDelegate({ name: "FontColorSwatch", className: "highlight-swatch" }, { name: "FabricTextHighlight" }, "FabricTextHighlight"),
        subMenuProps: {
            className: 'rooster-command-bar-color-container',
            key: 'highlight-sub',
            shouldFocusOnMount: true,
            directionalHint: DirectionalHint.bottomLeftEdge,
            focusZoneProps: { direction: FocusZoneDirection.bidirectional },
            items: HighlightColorInfoList.map(
                (color: ColorInfo) =>
                    ({
                        className: 'rooster-command-bar-color-item',
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
        name: 'Font color',
        iconProps: _getIconProps('FontColor'),
        onRender: _getIconOnRenderDelegate({ name: "FontColorSwatch", className: "color-swatch" }, { name: "FontColorA" }, "FontColor"),
        subMenuProps: {
            className: 'rooster-command-bar-color-container',
            key: 'font-color-sub',
            shouldFocusOnMount: true,
            directionalHint: DirectionalHint.bottomLeftEdge,
            focusZoneProps: { direction: FocusZoneDirection.bidirectional },
            items: FontColorInfoList.map(
                (color: ColorInfo) =>
                    ({
                        className: 'rooster-command-bar-color-item',
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
        name: 'Emoji',
        iconProps: { className: `${RoosterCommandBarIconClassName} rooster-emoji` } as IIconProps,
        handleChange: (editor: Editor, props: RoosterCommandBarProps) => props.emojiPlugin.startEmoji()
    },
    {
        key: RoosterCommmandBarButtonKeys.Outdent,
        name: 'Decrease indent',
        iconProps: _getIconProps('DecreaseIndentLegacy'),
        onRender: _getIconOnRenderDelegate({ name: "DecreaseIndentText" }, { name: "DecreaseIndentArrow" }, "DecreaseIndentLegacy"),
        handleChange: (editor: Editor, props: RoosterCommandBarProps) => (props.disableListWorkaround ? setNonCompatIndentation : setIndentation)(editor, Indentation.Decrease)
    },
    {
        key: RoosterCommmandBarButtonKeys.Indent,
        name: 'Increase indent',
        iconProps: _getIconProps('IncreaseIndentLegacy'),
        onRender: _getIconOnRenderDelegate({ name: "IncreaseIndentText" }, { name: "IncreaseIndentArrow" }, "IncreaseIndentLegacy"),
        handleChange: (editor: Editor, props: RoosterCommandBarProps) => (props.disableListWorkaround ? setNonCompatIndentation : setIndentation)(editor, Indentation.Increase)
    },
    {
        key: RoosterCommmandBarButtonKeys.Strikethrough,
        name: 'Strikethrough',
        iconProps: _getIconProps('Strikethrough'),
        getChecked: (formatState: FormatState) => formatState.isStrikeThrough,
        handleChange: (editor: Editor) => toggleStrikethrough(editor)
    },
    {
        key: RoosterCommmandBarButtonKeys.Header,
        name: 'Header',
        iconProps: _getIconProps('FontSize'),
        subMenuProps: {
            key: 'header-sub',
            shouldFocusOnMount: true,
            directionalHint: DirectionalHint.bottomLeftEdge,
            items: [
                {
                    key: 'header1',
                    name: 'Header 1',
                    className: 'rooster-command-bar-header1',
                    headerLevel: 1,
                    canCheck: true,
                    getChecked: _getCheckedForHeader,
                    isContextMenuItem: true,
                    handleChange: _handleChangeForHeader,
                    iconProps: null
                },
                {
                    key: 'header2',
                    name: 'Header 2',
                    className: 'rooster-command-bar-header2',
                    headerLevel: 2,
                    canCheck: true,
                    getChecked: _getCheckedForHeader,
                    isContextMenuItem: true,
                    handleChange: _handleChangeForHeader,
                    iconProps: null
                },
                {
                    key: 'header3',
                    name: 'Header 3',
                    className: 'rooster-command-bar-header3',
                    headerLevel: 3,
                    canCheck: true,
                    getChecked: _getCheckedForHeader,
                    isContextMenuItem: true,
                    handleChange: _handleChangeForHeader,
                    iconProps: null
                }
            ] as RoosterCommandBarButton[]
        }
    },
    {
        key: RoosterCommmandBarButtonKeys.ClearFormat,
        name: 'Clear format',
        iconProps: _getIconProps('ClearFormatting'),
        onRender: _getIconOnRenderDelegate({ name: "ClearFormattingA" }, { name: "ClearFormattingEraser" }, "ClearFormatting"),
        handleChange: (editor: Editor) => clearFormat(editor)
    },
    {
        key: RoosterCommmandBarButtonKeys.InsertImage,
        name: 'Insert image',
        iconProps: _getIconProps('Photo2'),
        onRender: _getIconOnRenderDelegate({ name: "Photo2Fill", className: "photo2-fill" }, { name: "Photo2" })
    },
    {
        key: RoosterCommmandBarButtonKeys.Link,
        name: 'Link',
        iconProps: _getIconProps('Link'),
        handleChange: (editor: Editor, props: RoosterCommandBarProps) => createLinkWithPrompt(editor, props.strings)
    },
    {
        key: RoosterCommmandBarButtonKeys.Unlink,
        name: 'Unlink',
        iconProps: _getIconProps('RemoveLink'),
        onRender: _getIconOnRenderDelegate({ name: "RemoveLinkChain" }, { name: "RemoveLinkX" }, "RemoveLink"),
        getDisabled: (formatState: FormatState) => !formatState.canUnlink,
        handleChange: (editor: Editor) => removeLink(editor)
    }
];
OutOfBoxCommandBarButtons.forEach((button: RoosterCommandBarButton) => {
    // For regular icons, use the out of box icon name--so don't specify a name
    button.onRender = button.onRender || _getIconOnRenderDelegate({ name: undefined }, {});
    button.className = RoosterCommandBarButtonRootClassName;
});

export const OutOfBoxCommandBarButtonMap = OutOfBoxCommandBarButtons.reduce(
    (result: { [key: string]: RoosterCommandBarButton }, item: RoosterCommandBarButton) => {
        result[item.key] = item;
        return result;
    },
    {} as { [key: string]: RoosterCommandBarButton }
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
    setBackgroundColor(editor, color);
}

function _getIconOnRenderDelegate(asset: { name: string; className?: string }, secondAsset: { name?: string }, highContrastAssetName: string = null): ButtonOnRenderDelegate {
    const cacheKey = `${asset.name || ""}${secondAsset.name || ""}`;
    if (!OnRenderDelegateCache[cacheKey]) {
        const iconClassName = 'stacked-icon';
        let onRenderIcon: IRenderFunction<IButtonProps> = undefined;
        if (secondAsset.name) {
            onRenderIcon = () => (
                <div className="stacked-icon-container">
                    <Icon iconName={asset.name} className={css(iconClassName, asset.className)} />
                    <Icon iconName={secondAsset.name} className={css(iconClassName, `${iconClassName}-${secondAsset.name}`)} />
                    {highContrastAssetName && <Icon iconName={highContrastAssetName} className={css(iconClassName, 'high-contrast-icon')} />}
                </div>
            );
        }

        let cmdButton: IButton = null;
        OnRenderDelegateCache[cacheKey] = (item: RoosterCommandBarButton): JSX.Element => (
            <TooltipHost content={item.name} key={item.key}>
                <CommandBarButton
                    componentRef={ref => (cmdButton = ref)}
                    {...item as any}
                    ariaLabel={item.name}
                    menuProps={
                        item.subMenuProps && {
                            ...item.subMenuProps,
                            onDismiss: ev => {
                                item.subMenuProps.onDismiss(ev);
                                cmdButton.dismissMenu();
                            }
                        }
                    }
                    className={css('rooster-command-bar-button', item.buttonClassName)}
                    onRenderIcon={onRenderIcon}
                />
            </TooltipHost>
        );
    }

    return OnRenderDelegateCache[cacheKey];
}
