import { Callout, DirectionalHint } from "office-ui-fabric-react/lib/Callout";
import { Async, KeyCodes } from "office-ui-fabric-react/lib/Utilities";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { cacheGetCursorEventData, clearCursorEventDataCache, replaceTextBeforeCursorWithNode } from "roosterjs-editor-api";
import { Editor, EditorPlugin } from "roosterjs-editor-core";
import { PluginDomEvent, PluginEvent, PluginEventType } from "roosterjs-editor-types";
import { NullFunction, Strings } from "roosterjs-react-common";

import EmojiPane, { EmojiPaneProps } from "../components/EmojiPane";
import Emoji from "../schema/Emoji";
import { MoreEmoji } from "../utils/emojiList";
import { matchShortcut } from "../utils/searchEmojis";
import { EmojiNavBarProps } from "../components/EmojiNavBar";
import { EmojiStatusBarProps } from "../components/EmojiStatusBar";

const EMOJI_SEARCH_DELAY = 300;
const INTERNAL_EMOJI_FONT_NAME = "EmojiFont";
const EMOJI_FONT_LIST = "'Apple Color Emoji','Segoe UI Emoji', NotoColorEmoji,'Segoe UI Symbol','Android Emoji',EmojiSymbols";
// Regex looks for an emoji right before the : to allow contextual search immediately following an emoji
// MATCHES: 0: 😃:r
//          1: 😃
//          2: :r
const EMOJI_BEFORE_COLON_REGEX = /([\u0023-\u0039][\u20e3]|[\ud800-\udbff][\udc00-\udfff]|[\u00a9-\u00ae]|[\u2122-\u3299])*([:;][^:]*)/;
const KEYCODE_COLON = 186;
const KEYCODE_COLON_FIREFOX = 59;

export interface EmojiPluginOptions {
    strings?: Strings;
    calloutClassName?: string;
    onCalloutDismiss?: (ev?: any) => void;
    emojiPaneProps?: EmojiPaneProps;
    onKeyboardTriggered?: () => void;
    navBarProps?: Partial<EmojiNavBarProps>;
    statusBarProps?: Partial<EmojiStatusBarProps>;
}

export default class EmojiPlugin implements EditorPlugin {
    private _editor: Editor;
    private _contentDiv: HTMLDivElement;
    private _isSuggesting: boolean;
    private _pane: EmojiPane;
    private _eventHandledOnKeyDown: boolean;
    private _canUndoEmoji: boolean;
    private _timer: number;
    private _callout: Callout;
    private _async: Async;
    private _refreshCalloutDebounced: () => void;
    private _strings: Strings;

    constructor(private options: EmojiPluginOptions = {}) {
        this._async = new Async();
        this._refreshCalloutDebounced = this._async.debounce(() => this._refreshCallout(), 100);
        this._strings = options.strings;
    }

    public initialize(editor: Editor): void {
        this._editor = editor;
        const document = editor.getDocument();
        this._contentDiv = document.createElement("div");
        document.body.appendChild(this._contentDiv);
    }

    public setStrings(strings: Strings): void {
        this._strings = strings;
    }

    public dispose(): void {
        this.setIsSuggesting(false);
        this._contentDiv.parentElement.removeChild(this._contentDiv);
        this._contentDiv = null;
        this._editor = null;
        if (this._async) {
            this._async.dispose();
            this._async = null;
        }
    }

    public willHandleEventExclusively(event: PluginEvent): boolean {
        return this._isSuggesting && (event.eventType === PluginEventType.KeyDown || event.eventType === PluginEventType.KeyUp || event.eventType === PluginEventType.MouseUp);
    }

    public onPluginEvent(event: PluginEvent): void {
        const domEvent = event as PluginDomEvent;
        const keyboardEvent = domEvent.rawEvent as KeyboardEvent;

        if (event.eventType === PluginEventType.KeyDown) {
            this._eventHandledOnKeyDown = false;
            if (this._isSuggesting) {
                this._onKeyDownSuggestingDomEvent(domEvent);
            } else if (keyboardEvent.which === KeyCodes.backspace && this._canUndoEmoji) {
                // If KeyDown is backspace and canUndoEmoji, call editor undo
                this._editor.undo();
                this._handleEventOnKeyDown(domEvent);
                this._canUndoEmoji = false;
            }
        } else if (event.eventType === PluginEventType.KeyUp && !this._isModifierKey(keyboardEvent.key)) {
            if (this._isSuggesting) {
                this._onKeyUpSuggestingDomEvent(domEvent);
            } else {
                this._onKeyUpDomEvent(domEvent);
            }
        } else if (event.eventType === PluginEventType.MouseUp) {
            // If MouseUp, the emoji cannot be undone
            this._canUndoEmoji = false;
            this.setIsSuggesting(false);
        }
    }

    public setIsSuggesting(isSuggesting: boolean): void {
        if (this._isSuggesting === isSuggesting) {
            return;
        }

        this._isSuggesting = isSuggesting;
        if (this._isSuggesting) {
            ReactDOM.render(this._getCallout(), this._contentDiv);
        } else {
            ReactDOM.unmountComponentAtNode(this._contentDiv);
        }
    }

    public startEmoji(startingString: string = ":"): void {
        const { _editor: editor } = this;
        if (!editor) {
            return;
        }

        this.setIsSuggesting(true);
        editor.insertContent(startingString);
        this._triggerChangeEvent();
    }

    /**
     * On KeyDown suggesting DOM event
     * Try to insert emoji is possible
     * Intercept arrow keys to move selection if popup is shown
     */
    private _onKeyDownSuggestingDomEvent(event: PluginDomEvent): void {
        // If key is enter, try insert emoji at selection
        // If key is space and selection is shortcut, try insert emoji
        const keyboardEvent = event.rawEvent as KeyboardEvent;
        const selectedEmoji = this._pane.getSelectedEmoji();
        const wordBeforeCursor = this._getWordBeforeCursor(event);

        let emoji: Emoji;
        switch (keyboardEvent.which) {
            case KeyCodes.enter:
            case KeyCodes.space:
                // check if selection is on the "..." and show full picker if so, otherwise try to apply emoji
                if (this._tryShowFullPicker(event, selectedEmoji, wordBeforeCursor)) {
                    break;
                }

                // We only want to insert on space if the word before the cursor is a shortcut
                // If the timer is not null, that means we have a search queued.
                // Check to see is the word before the cursor matches a shortcut first
                // Otherwise if the search completed and it is a shortcut, insert the first item
                if (this._timer) {
                    emoji = matchShortcut(wordBeforeCursor);
                } else {
                    emoji = selectedEmoji;
                }
                break;
            case KeyCodes.left:
            case KeyCodes.right:
                this._pane.navigate(keyboardEvent.which === KeyCodes.left ? -1 : 1);
                this._handleEventOnKeyDown(event);
                break;
            case KeyCodes.escape:
                this.setIsSuggesting(false);
                this._handleEventOnKeyDown(event);
        }

        if (emoji && (this._canUndoEmoji = this._insertEmoji(emoji, wordBeforeCursor))) {
            this._handleEventOnKeyDown(event);
        }
    }

    private _tryShowFullPicker(event: PluginDomEvent, selectedEmoji: Emoji, wordBeforeCursor: string): boolean {
        if (selectedEmoji !== MoreEmoji) {
            return false;
        }

        this._handleEventOnKeyDown(event);
        this._pane.showFullPicker(wordBeforeCursor);
        return true;
    }

    /**
     * On KeyUp suggesting DOM event
     * If key is character, update search term
     * Otherwise set isSuggesting to false
     */
    private _onKeyUpSuggestingDomEvent(event: PluginDomEvent): void {
        if (this._eventHandledOnKeyDown) {
            return;
        }

        const keyboardEvent = event.rawEvent as KeyboardEvent;

        // If this is a character key or backspace
        // Clear the timer as we will either queue a new timer or stop suggesting
        if ((keyboardEvent.key.length === 1 && keyboardEvent.which !== KeyCodes.space) || keyboardEvent.which === KeyCodes.backspace) {
            window.clearTimeout(this._timer);
            this._timer = null;
        }

        const wordBeforeCursor = this._getWordBeforeCursor(event);
        if (wordBeforeCursor) {
            this._timer = window.setTimeout(() => {
                if (this._pane) {
                    this._pane.setSearch(wordBeforeCursor);
                    this._timer = null;
                }
            }, EMOJI_SEARCH_DELAY);
        } else {
            this.setIsSuggesting(false);
        }
    }

    private _onKeyUpDomEvent(event: PluginDomEvent): void {
        if (this._eventHandledOnKeyDown) {
            return;
        }

        const keyboardEvent = event.rawEvent as KeyboardEvent;
        const wordBeforeCursor = this._getWordBeforeCursor(event);
        if ((keyboardEvent.which === KEYCODE_COLON || keyboardEvent.which === KEYCODE_COLON_FIREFOX) && wordBeforeCursor === ":") {
            const { onKeyboardTriggered = NullFunction } = this.options;
            this.setIsSuggesting(true);
            onKeyboardTriggered();
        } else if (wordBeforeCursor) {
            const cursorData = cacheGetCursorEventData(event, this._editor);
            const charBeforeCursor = cursorData ? cursorData.getXCharsBeforeCursor(1) : null;

            // It is possible that the word before the cursor is ahead of the pluginEvent we are handling
            // ex. WordBeforeCursor is ":D"" but the event we are currently handling is for the : key
            // Check that the char before the cursor is actually the key event we are currently handling
            // Otherwise we set canUndoEmoji to early and user is unable to backspace undo on the inserted emoji
            if (keyboardEvent.key === charBeforeCursor) {
                const emoji = matchShortcut(wordBeforeCursor);
                if (emoji && this._insertEmoji(emoji, wordBeforeCursor)) {
                    clearCursorEventDataCache(event);
                    this._canUndoEmoji = true;
                }
            }
        }
    }

    private _insertEmoji(emoji: Emoji, wordBeforeCursor: string): boolean {
        let inserted = false;
        this._editor.addUndoSnapshot();

        const node = this._editor.getDocument().createElement("span");
        node.innerText = emoji.codePoint;
        if (wordBeforeCursor && replaceTextBeforeCursorWithNode(this._editor, wordBeforeCursor, node, false /*exactMatch*/)) {
            inserted = true;
            this._canUndoEmoji = true;

            // Update the editor cursor to be after the inserted node
            window.requestAnimationFrame(() => {
                if (this._editor && this._editor.contains(node)) {
                    const newSelectionRange = this._editor.getDocument().createRange();
                    newSelectionRange.setStartAfter(node);
                    newSelectionRange.collapse(true);
                    this._editor.updateSelection(newSelectionRange);
                    this._editor.addUndoSnapshot();
                }
            });
        } else {
            inserted = this._editor.insertNode(node);
        }

        inserted && this._triggerChangeEvent();

        this._tryPatchEmojiFont();
        this.setIsSuggesting(false);

        return inserted;
    }

    private _triggerChangeEvent(): void {
        this._editor.triggerContentChangedEvent("Emoji");
    }

    private _isModifierKey(key: string): boolean {
        return key === "Shift" || key === "Control" || key === "Alt" || key === "Command";
    }

    private _handleEventOnKeyDown(event: PluginDomEvent): void {
        this._eventHandledOnKeyDown = true;
        event.rawEvent.preventDefault();
        event.rawEvent.stopImmediatePropagation();
    }

    private _getCallout(): JSX.Element {
        const { calloutClassName, emojiPaneProps = {}, navBarProps, statusBarProps } = this.options;

        const cursorRect = this._editor.getCursorRect();
        const point = {
            x: cursorRect.left,
            y: (cursorRect.top + cursorRect.bottom) / 2
        };
        const gap = (cursorRect.bottom - cursorRect.top) / 2 + 5;

        return (
            <Callout
                className={calloutClassName}
                target={point}
                directionalHint={DirectionalHint.bottomAutoEdge}
                isBeakVisible={false}
                gapSpace={gap}
                onDismiss={this._onCalloutDismissInternal}
                ref={this._calloutRef}
            >
                <EmojiPane
                    {...emojiPaneProps}
                    ref={ref => (this._pane = ref)}
                    onSelect={this._onSelectFromPane}
                    strings={this._strings || {}}
                    onLayoutChange={this._refreshCalloutDebounced}
                    navBarProps={navBarProps}
                    statusBarProps={statusBarProps} 
                    searchDisabled={!this._strings || emojiPaneProps.searchDisabled}
                />
            </Callout>
        );
    }

    private _calloutRef = (ref: Callout): void => {
        this._callout = ref;
    };

    private _refreshCallout(): void {
        this._callout.forceUpdate();
    }

    private _onCalloutDismissInternal = (ev?: any): void => {
        this.setIsSuggesting(false);
        if (this.options.onCalloutDismiss) {
            this.options.onCalloutDismiss(ev);
        }
    };

    private _tryPatchEmojiFont(): boolean {
        // This is not perfect way of doing this, but cannot find a better way.
        // Essentially what is happening is, emoji requires some special font to render properly. Without those font, it may render black and white
        // The fix we have right now is to find the topest block element and patch it with emoji font
        const range = this._editor.getSelectionRange();
        const inlineElement = range ? this._editor.getInlineElementAtNode(range.startContainer) : null;
        const blockElement = inlineElement ? inlineElement.getParentBlock() : null;
        if (blockElement) {
            const blockNode = blockElement.getStartNode() as HTMLElement;
            const fontFamily = blockNode.style.fontFamily;
            if (fontFamily && fontFamily.toLowerCase().indexOf("emoji") < 0) {
                blockNode.style.fontFamily = fontFamily + "," + INTERNAL_EMOJI_FONT_NAME + "," + EMOJI_FONT_LIST;
                return true;
            }
        }

        return false;
    }

    private _getWordBeforeCursor(event: PluginEvent): string {
        const cursorData = cacheGetCursorEventData(event, this._editor);
        const wordBeforeCursor = cursorData ? cursorData.wordBeforeCursor : null;
        const matches = EMOJI_BEFORE_COLON_REGEX.exec(wordBeforeCursor);
        return matches && matches.length > 2 && matches[0] === wordBeforeCursor ? matches[2] : null;
    }

    private _onSelectFromPane = (emoji: Emoji, wordBeforeCursor: string): void => {
        if (emoji === MoreEmoji) {
            this._pane.showFullPicker(wordBeforeCursor);
            return;
        }

        this._insertEmoji(emoji, wordBeforeCursor);
    };
}
