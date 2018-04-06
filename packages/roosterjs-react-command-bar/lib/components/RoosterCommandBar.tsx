import * as React from 'react';
import { Async, css } from 'office-ui-fabric-react/lib/Utilities';
import { CommandBar, ICommandBarItemProps } from '@uifabric/experiments/lib/CommandBar';
import { createFormatState } from 'roosterjs-react-editor';
import { Editor } from 'roosterjs-editor-core';
import { FormatState } from 'roosterjs-editor-types';
import { getFormatState } from 'roosterjs-editor-api';
import { OOB_COMMAND_BAR_ITEMS, OOB_COMMAND_BAR_ITEM_MAP } from '../utils/OutOfBoxCommands';
import RoosterCommandBarPluginInterface from '../schema/RoosterCommandBarPluginInterface';

export interface RoosterCommandBarProps {
    buttonNames?: { [key: string]: string };
    className?: string;
    roosterCommandBarPlugin: RoosterCommandBarPluginInterface;
    visibleButtonKeys?: string[];
    calloutClassName?: string;
    calloutOnDismiss?: (ev: React.FocusEvent<HTMLElement>) => void;
}

export interface RoosterCommandBarState {
    formatState: FormatState;
}

export default class RoosterCommandBar extends React.Component<RoosterCommandBarProps, RoosterCommandBarState> {
    private _buttonKeys: string[];
    private _async: Async;
    private _updateFormatStateDebounced: () => void;

    constructor(props: RoosterCommandBarProps) {
        super(props);

        this.state = { formatState: createFormatState() };
        this._buttonKeys = props.visibleButtonKeys || OOB_COMMAND_BAR_ITEMS.map(item => item.key);
        this._async = new Async();
        this._updateFormatStateDebounced = this._async.debounce(() => this._updateFormatState(), 100);
    }

    public render(): JSX.Element {
        const { className } = this.props;

        return (
            <div className={css("rooster-command-bar", className)}>
                <CommandBar
                    // TODO update experimental OfficeFabric CommandBar
                    /* overflowItemProps={{ menuClassName: calloutClassName, onAfterMenuDismiss: calloutOnDismiss, } as IOverflowItemProps} */
                    className={css("command-bar")}
                    items={this._buttonKeys
                        .map(key => this._getMenuItem(OOB_COMMAND_BAR_ITEM_MAP[key]))
                        .filter(menuItem => !!menuItem)}
                />
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

    public refreshFormatState(): void {
        this._updateFormatStateDebounced();
    }

    private _getMenuItem(commandBarItem: ICommandBarItemProps): ICommandBarItemProps {
        if (!commandBarItem) {
            return null;
        }

        const { buttonNames } = this.props;
        const { formatState } = this.state;
        const item = { ...commandBarItem }; // make a copy of the OOB item template

        if (item.getChecked) {
            item.checked = item.getChecked(formatState);
            item.className = css({ "is-checked": item.checked });
        }
        if (item.getDisabled) {
            item.disabled = item.getDisabled(formatState);
        }
        item.onClick = this._onCommandBarItemClick.bind(this, item);
        item.iconOnly = true;
        if (buttonNames) {
            item.name = buttonNames[item.key];
            item.title = item.name;
        }

        return item;
    }

    private _onCommandBarItemClick = (item: ICommandBarItemProps) => {
        const { roosterCommandBarPlugin } = this.props;

        const editor: Editor = roosterCommandBarPlugin.getEditor();
        if (editor && item.handleChange) {
            item.handleChange(editor);
        }
        this._updateFormatState();
    };

    private _updateFormatState = (): void => {
        const { roosterCommandBarPlugin } = this.props;

        const editor: Editor = roosterCommandBarPlugin.getEditor();
        const formatState = editor ? getFormatState(editor) : null;
        if (formatState && this._isFormatStateChanged(formatState)) {
            this.setState({ formatState });
        }
    }

    private _isFormatStateChanged(newState: FormatState): boolean {
        const { formatState } = this.state;
        for (const key in formatState) {
            if (formatState[key] !== newState[key]) {
                return true;
            }
        }

        return false;
    }
}
