import './RoosterCommandBar.scss.g';

import { ICalloutProps } from 'office-ui-fabric-react/lib/Callout';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { IContextualMenuItem, IContextualMenuProps } from 'office-ui-fabric-react/lib/ContextualMenu';
import { FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { Async, css } from 'office-ui-fabric-react/lib/Utilities';
import * as React from 'react';
import { getFormatState, insertImage } from 'roosterjs-editor-api';
import { Editor } from 'roosterjs-editor-core';
import { ChangeSource, FormatState } from 'roosterjs-editor-types';
import { createFormatState } from 'roosterjs-react-editor';

import { RoosterCommandBarButton, RoosterCommandBarProps, RoosterCommandBarState } from '../schema/RoosterCommandBarSchema';
import {
    OutOfBoxCommandBarButtonMap,
    OutOfBoxCommandBarButtons,
    RoosterCommandBarButtonRootClassName,
    RoosterCommandBarIconClassName,
    RoosterCommmandBarButtonKeys as ButtonKeys,
} from '../utils/OutOfBoxCommandBarButtons';

const DisplayNoneStyle = { display: 'none' } as React.CSSProperties;

export default class RoosterCommandBar extends React.PureComponent<RoosterCommandBarProps, RoosterCommandBarState> {
    private _async: Async;
    private _updateFormatStateDebounced: () => void;
    private _fileInput: HTMLInputElement;
    private _buttons: RoosterCommandBarButton[];

    constructor(props: RoosterCommandBarProps) {
        super(props);

        this.state = { formatState: createFormatState() };
        this._initButtons(props);

        this._async = new Async();
        this._updateFormatStateDebounced = this._async.debounce(() => this._updateFormatState(), 100);
    }

    public render(): JSX.Element {
        const { className, calloutClassName, calloutOnDismiss, overflowMenuProps, commandBarClassName } = this.props;

        // with the newest changes on the editor, refresh the buttons (e.g. bold button being selected if text selected is bold and header being checked if used)
        this._buttons.forEach(this._refreshButtonStates);
        return (
            <div className={css('rooster-command-bar', className)}>
                <CommandBar
                    className={css('rooster-command-bar-base', commandBarClassName)}
                    items={this._buttons}
                    overflowMenuProps={
                        {
                            ...overflowMenuProps,
                            calloutProps: {
                                className: calloutClassName
                            } as ICalloutProps,
                            onDismiss: calloutOnDismiss,
                            className: css('rooster-command-bar-overflow', overflowMenuProps && overflowMenuProps.className),
                            focusZoneProps: { direction: FocusZoneDirection.horizontal }
                        } as Partial<IContextualMenuProps>
                    }
                />
                <input type="file" ref={this._fileInputOnRef} accept="image/*" style={DisplayNoneStyle} onChange={this._fileInputOnChange} />
            </div>
        );
    }

    public componentDidMount(): void {
        const { roosterCommandBarPlugin } = this.props;

        roosterCommandBarPlugin.registerRoosterCommandBar(this);
    }

    public componentWillUnmount(): void {
        const { roosterCommandBarPlugin } = this.props;

        roosterCommandBarPlugin.unregisterRoosterCommandBar(this);

        if (this._async) {
            this._async.dispose();
            this._async = null;
        }
    }

    public componentWillReceiveProps(nextProps: RoosterCommandBarProps, nextState: RoosterCommandBarState) {
        if (nextProps.buttonOverrides !== this.props.buttonOverrides) {
            this._initButtons(nextProps);
        }
    }

    public refreshFormatState(): void {
        this._updateFormatStateDebounced();
    }

    private _initButtons(props: RoosterCommandBarProps): void {
        const { buttonOverrides = [], emojiPlugin } = this.props;

        const buttonMap = { ...OutOfBoxCommandBarButtonMap };
        const visibleButtonKeys = OutOfBoxCommandBarButtons.map(item => item.key);

        for (const button of buttonOverrides) {
            if (!button) {
                continue;
            }

            const currentButton = buttonMap[button.key];
            buttonMap[button.key] = currentButton ? { ...currentButton, ...button } : button;

            if (visibleButtonKeys.indexOf(button.key) === -1) {
                visibleButtonKeys.push(button.key);
            }
        }
        if (!emojiPlugin) {
            const emojiIndex = visibleButtonKeys.indexOf(ButtonKeys.Emoji);
            if (emojiIndex > -1) {
                visibleButtonKeys.splice(emojiIndex, 1);
            }
        }

        this._buttons = visibleButtonKeys.map(key => this._createButtons(buttonMap[key])).filter(b => !!b && !b.exclude);
        this._buttons.sort((l: RoosterCommandBarButton, r: RoosterCommandBarButton) => {
            if (l.order !== r.order) {
                const leftOrder = l.order == null ? Number.MAX_VALUE : l.order;
                const rightOrder = r.order == null ? Number.MAX_VALUE : r.order;
                return leftOrder - rightOrder;
            }

            return visibleButtonKeys.indexOf(l.key) - visibleButtonKeys.indexOf(r.key);
        });
    }

    private _fileInputOnRef = (ref: HTMLInputElement): void => {
        this._fileInput = ref;
    };

    private _fileInputOnChange = (): void => {
        const { roosterCommandBarPlugin, imageManager } = this.props;

        const editor: Editor = roosterCommandBarPlugin.getEditor();
        const file = this._fileInput.files[0];
        if (editor && !editor.isDisposed() && file) {
            if (imageManager) {
                const placeholder = imageManager.upload(editor, file);
                editor.insertNode(placeholder);
                editor.triggerContentChangedEvent(ChangeSource.Format);
                editor.addUndoSnapshot();
            } else {
                insertImage(editor, file);
            }
            this._fileInput.value = '';
        }
    };

    private _refreshButtonStates = (commandBarButton: RoosterCommandBarButton): RoosterCommandBarButton => {
        if (!commandBarButton) {
            return null;
        }

        const { formatState } = this.state;

        if (commandBarButton.getChecked) {
            const checked = commandBarButton.getChecked(formatState);
            commandBarButton.checked = checked;

            if (!commandBarButton.isContextMenuItem) {
                commandBarButton.className = css(RoosterCommandBarButtonRootClassName, 'rooster-command-toggle', { 'is-checked': checked });
                commandBarButton["aria-pressed"] = checked; // OF 5.0
            }
        }
        if (commandBarButton.getDisabled) {
            commandBarButton.disabled = commandBarButton.getDisabled(formatState);
        }
        if (commandBarButton.subMenuProps && commandBarButton.subMenuProps.items) {
            commandBarButton.subMenuProps.items.forEach(this._refreshButtonStates);
        }

        return commandBarButton;
    };

    private _createButtons = (commandBarButton: RoosterCommandBarButton): RoosterCommandBarButton => {
        if (!commandBarButton) {
            return null;
        }

        const { strings, calloutClassName, calloutOnDismiss } = this.props;
        const button = { ...commandBarButton }; // make a copy of the OOB button template since we're changing its properties

        button.onClick = button.onClick || this._onCommandBarButtonClick.bind(this, button);
        button.iconOnly = true;
        if (button.iconProps) {
            const { className = '' } = button.iconProps;
            button.iconProps = {
                ...button.iconProps,
                className: className.split(' ').indexOf(RoosterCommandBarIconClassName) >= 0 ? className : css(RoosterCommandBarIconClassName, className)
            };
        }
        if (strings && strings[button.key] != null) {
            button.name = strings[button.key];
            if (button.title) {
                button.title = button.name; // for buttons like color which has title/tooltip
            }
        }
        if (button.subMenuProps && button.subMenuProps.items) {
            button.subMenuProps = { ...button.subMenuProps }; // make a copy of the OOB submenu properties since we're changing them
            button.subMenuProps.items = button.subMenuProps.items.map(this._createButtons);
            button.subMenuProps.calloutProps = { className: calloutClassName } as ICalloutProps;
            button.subMenuProps.onDismiss = calloutOnDismiss;
        }

        // make sure the initial states are correct
        this._refreshButtonStates(button);

        return button;
    };

    private _onCommandBarButtonClick = (button: RoosterCommandBarButton | IContextualMenuItem) => {
        const { roosterCommandBarPlugin, onButtonClicked } = this.props;

        const editor: Editor = roosterCommandBarPlugin.getEditor();
        if (editor && button.handleChange) {
            const outOfBoxItem: RoosterCommandBarButton = button;
            outOfBoxItem.handleChange(editor, this.props, this.state);
        }

        // special case insert image
        if (button.key === ButtonKeys.InsertImage) {
            this._fileInput.click();
        }

        this._updateFormatState();
        onButtonClicked && onButtonClicked(button.key);
    };

    private _updateFormatState = (): void => {
        const { roosterCommandBarPlugin } = this.props;

        const editor: Editor = roosterCommandBarPlugin.getEditor();
        const formatState = editor ? getFormatState(editor) : null;
        if (formatState && this._hasFormatStateChanged(formatState)) {
            this.setState({ formatState });
        }
    };

    private _hasFormatStateChanged(newState: FormatState): boolean {
        const { formatState } = this.state;

        for (const key in formatState) {
            if (formatState[key] !== newState[key]) {
                return true;
            }
        }

        return false;
    }
}
