import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { Async, KeyCodes } from 'office-ui-fabric-react/lib/Utilities';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { cacheGetCursorEventData, clearCursorEventDataCache, replaceTextBeforeCursorWithNode } from 'roosterjs-editor-api';
import { Editor, EditorPlugin } from 'roosterjs-editor-core';
import { PluginDomEvent, PluginEvent, PluginEventType } from 'roosterjs-editor-types';
import { NullFunction } from 'roosterjs-react-common';

import EmojiPane, { EmojiPaneProps } from '../components/EmojiPane';
import Emoji from '../schema/Emoji';
import { Strings } from '../strings/emojiStrings';
import { matchShortcut } from '../utils/searchEmojis';

const EMOJI_SEARCH_DELAY = 300;
const INTERNAL_EMOJI_FONT_NAME = 'EmojiFont';
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
}

export default class EmojiPlugin implements EditorPlugin {
    private editor: Editor;
    private contentDiv: HTMLDivElement;
    private isSuggesting: boolean;
    private pane: EmojiPane;
    private eventHandledOnKeyDown: boolean;
    private canUndoEmoji: boolean;
    private timer: number;
    private callout: Callout;
    private async: Async;
    private refreshCalloutDebounced: () => void;

    constructor(private options: EmojiPluginOptions = {}) {
        this.async = new Async();
        this.refreshCalloutDebounced = this.async.debounce(() => this.refreshCallout(), 100);
    }

    public initialize(editor: Editor): void {
        this.editor = editor;

        const document = editor.getDocument();
        this.contentDiv = document.createElement('div');
        document.body.appendChild(this.contentDiv);
    }

    public dispose(): void {
        this.setIsSuggesting(false);
        this.contentDiv.parentElement.removeChild(this.contentDiv);
        this.contentDiv = null;
        this.editor = null;
        if (this.async) {
            this.async.dispose();
            this.async = null;
        }
    }

    public willHandleEventExclusively(event: PluginEvent): boolean {
        return this.isSuggesting && (event.eventType === PluginEventType.KeyDown || event.eventType === PluginEventType.KeyUp || event.eventType === PluginEventType.MouseUp);
    }

    public onPluginEvent(event: PluginEvent): void {
        const domEvent = event as PluginDomEvent;
        const keyboardEvent = domEvent.rawEvent as KeyboardEvent;

        if (event.eventType === PluginEventType.KeyDown) {
            this.eventHandledOnKeyDown = false;
            if (this.isSuggesting) {
                this.onKeyDownSuggestingDomEvent(domEvent);
            } else if (keyboardEvent.which === KeyCodes.backspace && this.canUndoEmoji) {
                // If KeyDown is backspace and canUndoEmoji, call editor undo
                this.editor.undo();
                this.handleEventOnKeyDown(domEvent);
                this.canUndoEmoji = false;
            }
        } else if (event.eventType === PluginEventType.KeyUp && !this.isModifierKey(keyboardEvent.key)) {
            if (this.isSuggesting) {
                this.onKeyUpSuggestingDomEvent(domEvent);
            } else {
                this.onKeyUpDomEvent(domEvent);
            }
        } else if (event.eventType === PluginEventType.MouseUp) {
            // If MouseUp, the emoji cannot be undone
            this.canUndoEmoji = false;
            this.setIsSuggesting(false);
        }
    }

    public setIsSuggesting(isSuggesting: boolean): void {
        if (this.isSuggesting === isSuggesting) {
            return;
        }

        this.isSuggesting = isSuggesting;
        if (this.isSuggesting) {
            ReactDOM.render(this.getCallout(), this.contentDiv);
        } else {
            ReactDOM.unmountComponentAtNode(this.contentDiv);
        }
    }

    public startEmoji(startingString: string = ':'): void {
        const { editor } = this;
        if (!editor) {
            return;
        }

        this.setIsSuggesting(true);
        editor.insertContent(startingString);
        this.triggerChangeEvent();
    }

    /**
     * On KeyDown suggesting DOM event
     * Try to insert emoji is possible
     * Intercept arrow keys to move selection if popup is shown
     */
    private onKeyDownSuggestingDomEvent(event: PluginDomEvent): void {
        // If key is enter, try insert emoji at selection
        // If key is space and selection is shortcut, try insert emoji
        const keyboardEvent = event.rawEvent as KeyboardEvent;
        const selectedEmoji = this.pane.getSelectedEmoji();
        const wordBeforeCursor = this.getWordBeforeCursor(event);

        let emoji: Emoji;
        switch (keyboardEvent.which) {
            case KeyCodes.enter:
                // check if selection is on the "..." and show full picker if so, otherwise try to apply emoji
                if (!this.tryShowFullPicker(event, selectedEmoji)) {
                    // If the timer is not null, that means we have a search queued.
                    // We don't have the latest search results for the word before the cursor yet
                    // Check to see if the word before the cursor matches a shortcut first
                    // If the timer is not null or we did not get a shortcut match, insert the first item
                    if (this.timer) {
                        emoji = matchShortcut(wordBeforeCursor);
                    }
                    emoji = emoji || selectedEmoji;
                }
                break;
            case KeyCodes.space:
                // check if selection is on the "..." and show full picker if so, otherwise try to apply emoji
                if (this.tryShowFullPicker(event, selectedEmoji)) {
                    break;
                }

                // We only want to insert on space if the word before the cursor is a shortcut
                // If the timer is not null, that means we have a search queued.
                // Check to see is the word before the cursor matches a shortcut first
                // Otherwise if the search completed and it is a shortcut, insert the first item
                if (this.timer) {
                    emoji = matchShortcut(wordBeforeCursor);
                } else {
                    emoji = selectedEmoji;
                }
                break;
            case KeyCodes.left:
            case KeyCodes.right:
                this.pane.navigate(keyboardEvent.which === KeyCodes.left ? -1 : 1);
                this.handleEventOnKeyDown(event);
                break;
            case KeyCodes.escape:
                this.setIsSuggesting(false);
                this.handleEventOnKeyDown(event);
        }

        if (emoji && (this.canUndoEmoji = this.insertEmoji(emoji, wordBeforeCursor))) {
            this.handleEventOnKeyDown(event);
        }
    }

    private tryShowFullPicker(event: PluginDomEvent, selectedEmoji: Emoji): boolean {
        if (selectedEmoji && !selectedEmoji.codePoint) {
            const wordBeforeCursor = this.getWordBeforeCursor(event);
            this.handleEventOnKeyDown(event);
            this.pane.showFullPicker(wordBeforeCursor);
            return true;
        }

        return false;
    }

    /**
     * On KeyUp suggesting DOM event
     * If key is character, update search term
     * Otherwise set isSuggesting to false
     */
    private onKeyUpSuggestingDomEvent(event: PluginDomEvent): void {
        if (this.eventHandledOnKeyDown) {
            return;
        }

        const keyboardEvent = event.rawEvent as KeyboardEvent;

        // If this is a character key or backspace
        // Clear the timer as we will either queue a new timer or stop suggesting
        if ((keyboardEvent.key.length === 1 && keyboardEvent.which !== KeyCodes.space) || keyboardEvent.which === KeyCodes.backspace) {
            window.clearTimeout(this.timer);
            this.timer = null;
        }

        const wordBeforeCursor = this.getWordBeforeCursor(event);
        if (wordBeforeCursor) {
            this.timer = window.setTimeout(() => {
                if (this.pane) {
                    this.pane.setSearch(wordBeforeCursor);
                    this.timer = null;
                }
            }, EMOJI_SEARCH_DELAY);
        } else {
            this.setIsSuggesting(false);
        }
    }

    private onKeyUpDomEvent(event: PluginDomEvent): void {
        if (this.eventHandledOnKeyDown) {
            return;
        }

        const keyboardEvent = event.rawEvent as KeyboardEvent;
        const wordBeforeCursor = this.getWordBeforeCursor(event);
        if ((keyboardEvent.which === KEYCODE_COLON || keyboardEvent.which === KEYCODE_COLON_FIREFOX) && wordBeforeCursor === ':') {
            const { onKeyboardTriggered = NullFunction } = this.options;
            this.setIsSuggesting(true);
            onKeyboardTriggered();
        } else if (wordBeforeCursor) {
            const cursorData = cacheGetCursorEventData(event, this.editor);
            const charBeforeCursor = cursorData ? cursorData.getXCharsBeforeCursor(1) : null;

            // It is possible that the word before the cursor is ahead of the pluginEvent we are handling
            // ex. WordBeforeCursor is ":D"" but the event we are currently handling is for the : key
            // Check that the char before the cursor is actually the key event we are currently handling
            // Otherwise we set canUndoEmoji to early and user is unable to backspace undo on the inserted emoji
            if (keyboardEvent.key === charBeforeCursor) {
                const emoji = matchShortcut(wordBeforeCursor);
                if (emoji && this.insertEmoji(emoji, wordBeforeCursor)) {
                    clearCursorEventDataCache(event);
                    this.canUndoEmoji = true;
                }
            }
        }
    }

    private insertEmoji(emoji: Emoji, wordBeforeCursor: string): boolean {
        let inserted = false;
        this.editor.addUndoSnapshot();

        const node = this.editor.getDocument().createElement('span');
        node.innerText = emoji.codePoint;
        if (wordBeforeCursor && replaceTextBeforeCursorWithNode(this.editor, wordBeforeCursor, node, false /*exactMatch*/)) {
            inserted = true;
            this.canUndoEmoji = true;

            // Update the editor cursor to be after the inserted node
            window.requestAnimationFrame(() => {
                if (this.editor && this.editor.contains(node)) {
                    const newSelectionRange = this.editor.getDocument().createRange();
                    newSelectionRange.setStartAfter(node);
                    newSelectionRange.collapse(true);
                    this.editor.updateSelection(newSelectionRange);
                    this.editor.addUndoSnapshot();
                }
            });
        } else {
            inserted = this.editor.insertNode(node);
        }

        inserted && this.triggerChangeEvent();

        this.tryPatchEmojiFont();
        this.setIsSuggesting(false);

        return inserted;
    }

    private triggerChangeEvent(): void {
        this.editor.triggerContentChangedEvent('Emoji');
    }

    private isModifierKey(key: string): boolean {
        return key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Command';
    }

    private handleEventOnKeyDown(event: PluginDomEvent): void {
        this.eventHandledOnKeyDown = true;
        event.rawEvent.preventDefault();
        event.rawEvent.stopImmediatePropagation();
    }

    private getCallout(): JSX.Element {
        const { calloutClassName, emojiPaneProps, strings } = this.options;

        const cursorRect = this.editor.getCursorRect();
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
                onDismiss={this.onCalloutDismissInternal}
                ref={this.calloutRef}
            >
                <EmojiPane {...emojiPaneProps} ref={ref => (this.pane = ref)} onSelect={this.onSelectFromPane} strings={strings} onLayoutChange={this.refreshCalloutDebounced} />
            </Callout>
        );
    }

    private calloutRef = (ref: Callout): void => {
        this.callout = ref;
    };

    private refreshCallout(): void {
        this.callout.forceUpdate();
    }

    private onCalloutDismissInternal = (ev?: any): void => {
        this.setIsSuggesting(false);
        if (this.options.onCalloutDismiss) {
            this.options.onCalloutDismiss(ev);
        }
    };

    private tryPatchEmojiFont(): boolean {
        // This is not perfect way of doing this, but cannot find a better way.
        // Essentially what is happening is, emoji requires some special font to render properly. Without those font, it may render black and white
        // The fix we have right now is to find the topest block element and patch it with emoji font
        const range = this.editor.getSelectionRange();
        const inlineElement = range ? this.editor.getInlineElementAtNode(range.startContainer) : null;
        const blockElement = inlineElement ? inlineElement.getParentBlock() : null;
        if (blockElement) {
            const blockNode = blockElement.getStartNode() as HTMLElement;
            const fontFamily = blockNode.style.fontFamily;
            if (fontFamily && fontFamily.toLowerCase().indexOf('emoji') < 0) {
                blockNode.style.fontFamily = fontFamily + ',' + INTERNAL_EMOJI_FONT_NAME + ',' + EMOJI_FONT_LIST;
                return true;
            }
        }

        return false;
    }

    private getWordBeforeCursor(event: PluginEvent): string {
        const cursorData = cacheGetCursorEventData(event, this.editor);
        const wordBeforeCursor = cursorData ? cursorData.wordBeforeCursor : null;
        const matches = EMOJI_BEFORE_COLON_REGEX.exec(wordBeforeCursor);
        return matches && matches.length > 2 && matches[0] === wordBeforeCursor ? matches[2] : null;
    }

    private onSelectFromPane = (emoji: Emoji, wordBeforeCursor: string): void => {
        if (emoji && !emoji.codePoint) {
            this.pane.showFullPicker(wordBeforeCursor);
        } else {
            this.insertEmoji(emoji, wordBeforeCursor);
        }
    };
}
