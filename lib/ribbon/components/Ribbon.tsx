import * as React from 'react';
import RibbonButton, { RibbonButtonState } from '../schema/RibbonButton';
import RibbonProps from '../schema/RibbonProps';
import createFormatState from '../utils/createFormatState';
import { Alignment, Indentation, Direction } from 'roosterjs-editor-types';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { FormatState } from 'roosterjs-editor-types';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Image } from 'office-ui-fabric-react/lib/Image';
import { getFormatState } from 'roosterjs-editor-api';
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

const styles = require('./Ribbon.scss');
const classNames = require('classnames/bind').bind(styles);

const BOLD_SVG = require('../icons/bold.svg');
const ITALIC_SVG = require('../icons/italic.svg');
const UNDERLINE_SVG = require('../icons/underline.svg');
const BULLETS_SVG = require('../icons/bullets.svg');
const BULLETS_RTL_SVG = require('../icons/bullets-rtl.svg');
const NUMBERING_SVG = require('../icons/numbering.svg');
const NUMBERING_RTL_SVG = require('../icons/numbering-rtl.svg');
const OUTDENT_SVG = require('../icons/outdent.svg');
const OUTDENT_RTL_SVG = require('../icons/outdent-rtl.svg');
const INDENT_SVG = require('../icons/indent.svg');
const INDENT_RTL_SVG = require('../icons/indent-rtl.svg');
const ALIGNLEFT_SVG = require('../icons/alignleft.svg');
const ALIGNCENTER_SVG = require('../icons/aligncenter.svg');
const ALIGNRIGHT_SVG = require('../icons/alignright.svg');
const UNLINK_SVG = require('../icons/unlink.svg');
const SUPERSCRIPT_SVG = require('../icons/superscript.svg');
const SUBSCRIPT_SVG = require('../icons/subscript.svg');
const STRIKETHROUGH_SVG = require('../icons/strikethrough.svg');
const LTR_SVG = require('../icons/ltr.svg');
const RTL_SVG = require('../icons/rtl.svg');
const UNDO_SVG = require('../icons/undo.svg');
const REDO_SVG = require('../icons/redo.svg');
const REMOVEFORMAT_SVG = require('../icons/removeformat.svg');
const DROPDOWN_SVG = require('../icons/dropdown.svg');

const RIBBONSTATE_POLL_INTERVAL: number = 300;
const RIBBONITEM_WIDTH = 36;
const RIBBON_MARGIN = 12;

const BUTTONS = {
    bold: {
        title: 'Bold',
        imageUrl: BOLD_SVG,
        buttonState: formatState =>
            formatState.isBold ? RibbonButtonState.Checked : RibbonButtonState.Normal,
        onClick: editor => toggleBold(editor),
    },
    italic: {
        title: 'Italic',
        imageUrl: ITALIC_SVG,
        buttonState: formatState =>
            formatState.isItalic ? RibbonButtonState.Checked : RibbonButtonState.Normal,
        onClick: editor => toggleItalic(editor),
    },
    underline: {
        title: 'Underline',
        imageUrl: UNDERLINE_SVG,
        buttonState: formatState =>
            formatState.isUnderline ? RibbonButtonState.Checked : RibbonButtonState.Normal,
        onClick: editor => toggleUnderline(editor),
    },
    bullets: {
        title: 'Bullets',
        imageUrl: BULLETS_SVG,
        rtlImageUrl: BULLETS_RTL_SVG,
        buttonState: formatState =>
            formatState.isBullet ? RibbonButtonState.Checked : RibbonButtonState.Normal,
        onClick: editor => toggleBullet(editor),
    },
    numbering: {
        title: 'Numbering',
        imageUrl: NUMBERING_SVG,
        rtlImageUrl: NUMBERING_RTL_SVG,
        buttonState: formatState =>
            formatState.isNumbering ? RibbonButtonState.Checked : RibbonButtonState.Normal,
        onClick: editor => toggleNumbering(editor),
    },
    indent: {
        title: 'Increase indent',
        imageUrl: INDENT_SVG,
        rtlImageUrl: INDENT_RTL_SVG,
        onClick: editor => setIndentation(editor, Indentation.Increase),
    },
    outdent: {
        title: 'Decrease indent',
        imageUrl: OUTDENT_SVG,
        rtlImageUrl: OUTDENT_RTL_SVG,
        onClick: editor => setIndentation(editor, Indentation.Decrease),
    },
    alignleft: {
        title: 'Align left',
        imageUrl: ALIGNLEFT_SVG,
        onClick: editor => setAlignment(editor, Alignment.Left),
    },
    aligncenter: {
        title: 'Align center',
        imageUrl: ALIGNCENTER_SVG,
        onClick: editor => setAlignment(editor, Alignment.Center),
    },
    alignright: {
        title: 'Align right',
        imageUrl: ALIGNRIGHT_SVG,
        onClick: editor => setAlignment(editor, Alignment.Right),
    },
    unlink: {
        title: 'Remove hyperlink',
        imageUrl: UNLINK_SVG,
        buttonState: formatState =>
            formatState.canUnlink ? RibbonButtonState.Normal : RibbonButtonState.Disabled,
        onClick: editor => removeLink(editor),
    },
    subscript: {
        title: 'Subscript',
        imageUrl: SUBSCRIPT_SVG,
        buttonState: formatState =>
            formatState.isSubscript ? RibbonButtonState.Checked : RibbonButtonState.Normal,
        onClick: editor => toggleSubscript(editor),
    },
    superscript: {
        title: 'Superscript',
        imageUrl: SUPERSCRIPT_SVG,
        buttonState: formatState =>
            formatState.isSuperscript ? RibbonButtonState.Checked : RibbonButtonState.Normal,
        onClick: editor => toggleSuperscript(editor),
    },
    strikethrough: {
        title: 'Strikethrough',
        imageUrl: STRIKETHROUGH_SVG,
        buttonState: formatState =>
            formatState.isStrikeThrough ? RibbonButtonState.Checked : RibbonButtonState.Normal,
        onClick: editor => toggleStrikethrough(editor),
    },
    ltr: {
        title: 'Left-to-right',
        imageUrl: LTR_SVG,
        onClick: editor => setDirection(editor, Direction.LeftToRight),
    },
    rtl: {
        title: 'Right-to-left',
        imageUrl: RTL_SVG,
        onClick: editor => setDirection(editor, Direction.RightToLeft),
    },
    undo: {
        title: 'Undo',
        imageUrl: UNDO_SVG,
        buttonState: formatState =>
            formatState.canUndo ? RibbonButtonState.Normal : RibbonButtonState.Disabled,
        onClick: editor => editor.undo(),
    },
    redo: {
        title: 'Redo',
        imageUrl: REDO_SVG,
        buttonState: formatState =>
            formatState.canRedo ? RibbonButtonState.Normal : RibbonButtonState.Disabled,
        onClick: editor => editor.redo(),
    },
    removeformat: {
        title: 'Remove formatting',
        imageUrl: REMOVEFORMAT_SVG,
        onClick: editor => clearFormat(editor),
    },
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
        imageUrl: DROPDOWN_SVG,
        dropdown: (targetElement: HTMLElement) => {
            return (
                <Callout
                    className={'roosterRibbonButtonMore'}
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
                    className={'roosterRibbon'}
                    direction={FocusZoneDirection.horizontal}>
                    {visibleButtons.map(name => this.renderRibbonButton(name))}
                    {dropDownButton &&
                        dropDownButton.dropdown &&
                        dropDownButton.dropdown(
                            this.buttonElements[dropDown],
                            editor,
                            this.onDismiss,
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
        let imageUrl =
            this.props.isRtl && ribbonButton.rtlImageUrl
                ? ribbonButton.rtlImageUrl
                : ribbonButton.imageUrl;
        let buttonClassName = classNames('roosterRibbonIcon', {
            roosterRibbonButtonChecked:
                this.state.dropDown == name || buttonState == RibbonButtonState.Checked,
            roosterRibbonButtonDisabled: isDisabled,
        });
        let title = (this.props.stringMap && this.props.stringMap[name]) || ribbonButton.title;
        return (
            <div
                className={'roosterRibbonButton'}
                ref={ref => (this.buttonElements[name] = ref)}
                key={name}>
                <IconButton
                    className={buttonClassName}
                    data-is-focusable={true}
                    title={title}
                    onClick={!isDisabled && (() => this.onRibbonButton(name))}
                    onDragStart={this.cancelEvent}>
                    <Image
                        className={'roosterRibbonButtonImage'}
                        shouldFadeIn={false}
                        src={imageUrl}
                    />
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
            button.onClick(editor);
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
