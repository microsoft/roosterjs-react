import * as React from 'react';
import RibbonButton, { RibbonButtonState } from '../schema/RibbonButton';
import RibbonProps from '../schema/RibbonProps';
import createFormatState from '../utils/createFormatState';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { FormatState } from 'roosterjs-editor-types';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { getFormatState } from 'roosterjs-editor-api';
import * as Buttons from './buttons';
import * as Styles from './Ribbon.scss.g';

const classNames = require('classnames');
const RIBBONSTATE_POLL_INTERVAL = 300;
const RIBBONITEM_WIDTH = 36;
const RIBBON_MARGIN = 12;
const BUTTONS = {
    bold: Buttons.bold,
    italic: Buttons.italic,
    underline: Buttons.underline,
    font: Buttons.fontname,
    size: Buttons.fontsize,
    bkcolor: Buttons.backcolor,
    color: Buttons.textcolor,
    bullet: Buttons.bullets,
    number: Buttons.numbering,
    indent: Buttons.indent,
    outdent: Buttons.outdent,
    quote: Buttons.blockquote,
    left: Buttons.alignleft,
    center: Buttons.aligncenter,
    right: Buttons.alignright,
    link: Buttons.createlink,
    unlink: Buttons.unlink,
    sub: Buttons.subscript,
    super: Buttons.superscript,
    strike: Buttons.strikethrough,
    alttext: Buttons.imagealttext,
    ltr: Buttons.ltr,
    rtl: Buttons.rtl,
    undo: Buttons.undo,
    redo: Buttons.redo,
    unformat: Buttons.removeformat,
};

export interface RibbonState {
    dropDown: string;
    formatState: FormatState;
    visibleItemCount: number;
}

export default class Ribbon extends React.Component<RibbonProps, RibbonState> {
    private buttonElements: { [key: string]: HTMLElement } = {};
    private ribbonStateJobId: number;
    private ribbonContainer: HTMLElement;
    private buttonNames: string[];
    private moreButton: RibbonButton = {
        title: 'More formatting options',
        dropdown: (targetElement: HTMLElement) => {
            return (
                <Callout
                    className={Styles.ribbonButtonMore}
                    onDismiss={() => this.setCurrentDropDown(null)}
                    gapSpace={12}
                    target={targetElement}
                    isBeakVisible={false}
                    setInitialFocus={false}
                    directionalHint={DirectionalHint.topCenter}>
                    {this.buttonNames
                        .slice(this.state.visibleItemCount - 1, this.buttonNames.length)
                        .map(name => this.renderRibbonButton(name))}
                </Callout>
            );
        },
    };

    constructor(props: RibbonProps) {
        super(props);
        this.buttonNames = this.props.buttonNames || Object.keys(BUTTONS);
        this.state = {
            dropDown: null,
            formatState: createFormatState(),
            visibleItemCount: this.buttonNames.length,
        };
    }

    componentDidMount() {
        this.props.ribbonPlugin.registerRibbonComponent(this);
        this.onResize();
    }

    componentWillUnmount() {
        this.props.ribbonPlugin.unregisterRibbonComponent(this);
    }

    render() {
        let { visibleItemCount, dropDown } = this.state;
        let dropDownButton = dropDown && this.getButton(dropDown);
        let allButtons = this.buttonNames;
        let visibleButtons: string[];
        let editor = this.props.ribbonPlugin.getEditor();

        if (visibleItemCount == allButtons.length) {
            // Show all buttons in ribbon
            visibleButtons = allButtons;
        } else {
            // Show (maxItems - 1) buttons + affordance, and move rest to overflowItems
            visibleButtons = allButtons.slice(0, visibleItemCount - 1);
            visibleButtons.push('more');
        }

        return (
            <div ref={ref => (this.ribbonContainer = ref)} className={this.props.className}>
                <FocusZone
                    className={Styles.ribbon}
                    direction={FocusZoneDirection.horizontal}>
                    {visibleButtons.map(name => this.renderRibbonButton(name))}
                    {dropDownButton &&
                        dropDownButton.dropdown &&
                        dropDownButton.dropdown(
                            this.buttonElements[dropDown],
                            editor,
                            this.onDismiss,
                            this.props.stringMap,
                            this.state.formatState
                        )}
                </FocusZone>
            </div>
        );
    }

    onResize() {
        if (this.ribbonContainer) {
            let newWidth = this.ribbonContainer.clientWidth - RIBBON_MARGIN * 2;
            let minItemCount = this.getMinItemCount();
            let visibleItemCount = Math.min(
                Math.max(Math.floor(newWidth / RIBBONITEM_WIDTH), minItemCount),
                this.buttonNames.length
            );
            if (visibleItemCount != this.state.visibleItemCount) {
                this.setState({
                    dropDown: this.state.dropDown,
                    formatState: this.state.formatState,
                    visibleItemCount: visibleItemCount,
                });
            }
        }
    }

    onFormatChange() {
        if (this.ribbonStateJobId) {
            window.clearTimeout(this.ribbonStateJobId);
        }

        // if this.ribbonStateJobId is null, we need to schedule a job to pull state
        this.ribbonStateJobId = window.setTimeout(
            this.updateRibbonState,
            RIBBONSTATE_POLL_INTERVAL
        );
    }

    private renderRibbonButton(name: string): JSX.Element {
        let ribbonButton = this.getButton(name);

        if (!ribbonButton) {
            throw new Error('Cannot find button by name: ' + name);
        }

        let buttonState = ribbonButton.buttonState
            ? ribbonButton.buttonState(this.state.formatState)
            : RibbonButtonState.Normal;
        let isDisabled = buttonState == RibbonButtonState.Disabled;
        let buttonClassName = classNames(
            Styles.ribbonIcon, 
            (this.state.dropDown == name || buttonState == RibbonButtonState.Checked) && Styles.ribbonButtonChecked,
            isDisabled && Styles.ribbonButtonDisabled,
        );
        let title = (this.props.stringMap && this.props.stringMap[name]) || ribbonButton.title;
        return (
            <div
                className={Styles.ribbonButton}
                ref={ref => (this.buttonElements[name] = ref)}
                key={name}>
                <IconButton
                    className={buttonClassName}
                    data-is-focusable={true}
                    title={title}
                    onClick={!isDisabled && (() => this.onRibbonButton(name))}
                    onDragStart={this.cancelEvent}>
                    {
                        this.props.buttonRenderer ?
                            this.props.buttonRenderer(name, this.props.isRtl) :
                            <span>{name}</span>
                    }
                </IconButton>
            </div>
        );
    }

    private setCurrentDropDown(name: string) {
        this.setState({
            dropDown: name,
            formatState: this.state.formatState,
            visibleItemCount: this.state.visibleItemCount,
        });
    }

    private setFormatState(formatState: FormatState) {
        this.setState({
            dropDown: this.state.dropDown,
            formatState: formatState,
            visibleItemCount: this.state.visibleItemCount,
        });
    }

    private onRibbonButton(buttonName: string) {
        let button = this.getButton(buttonName);
        let plugin = this.props.ribbonPlugin;

        // Handle click event of the button
        if (button.dropdown) {
            // 1. If the button has a drop down, show the drop down
            this.setCurrentDropDown(this.state.dropDown == buttonName ? null : buttonName);
        } else if (button.onClick) {
            // 2. If the button has a customized onclick handler, invoke it
            let editor = plugin.getEditor();
            editor.focus();
            button.onClick(editor, this.props.stringMap || {});
            plugin.buttonClick(buttonName);
            this.updateRibbonState();
        }
    }

    private getButton(buttonName: string): RibbonButton {
        if (buttonName == 'more') {
            return this.moreButton;
        } else {
            return BUTTONS[buttonName] || (this.props.additionalButtons || {})[buttonName];
        }
    }

    private updateRibbonState = () => {
        this.ribbonStateJobId = null;
        let editor = this.props.ribbonPlugin.getEditor();
        let formatState = editor ? getFormatState(editor) : null;
        if (formatState && this.isFormatStateChanged(formatState)) {
            this.setFormatState(formatState);
        }
    };

    private isFormatStateChanged(state: FormatState) {
        let keys = Object.keys(this.state.formatState);
        for (let key of keys) {
            if (this.state.formatState[key] != state[key]) {
                return true;
            }
        }

        return false;
    }

    private getMinItemCount() {
        return this.props.minVisibleButtonCount > 0 ? this.props.minVisibleButtonCount : 8;
    }

    private onDismiss = () => {
        this.setCurrentDropDown(null);
    };

    private cancelEvent = (e: React.MouseEvent<EventTarget>) => {
        e.preventDefault();
    }
}
