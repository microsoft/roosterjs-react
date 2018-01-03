import Emoji from '../schema/Emoji';
import EmojiPane from '../components/EmojiPane';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { Editor, EditorPlugin } from 'roosterjs-editor-core';
import { PluginEvent, PluginDomEvent, PluginEventType } from 'roosterjs-editor-types';
import { Strings } from '../strings/emojiStrings';
import {
    cacheGetCursorEventData,
    replaceTextBeforeCursorWithNode,
    clearCursorEventDataCache,
} from 'roosterjs-editor-api';
import { matchShortcut } from '../utils/searchEmojis';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const EMOJI_SEARCH_DELAY = 300;
const INTERNAL_EMOJI_FONT_NAME = 'EmojiFont';
const EMOJI_FONT_LIST =
    "'Apple Color Emoji','Segoe UI Emoji', NotoColorEmoji,'Segoe UI Symbol','Android Emoji',EmojiSymbols";
// Regex looks for an emoji right before the : to allow contextual search immediately following an emoji
// MATCHES: 0: 😃:r
//          1: 😃
//          2: :r
const EMOJI_BEFORE_COLON_REGEX = /([\u0023-\u0039][\u20e3]|[\ud800-\udbff][\udc00-\udfff]|[\u00a9-\u00ae]|[\u2122-\u3299])*([:;][^:]*)/;

const enum Key {
    Backspace = 8,
    Enter = 13,
    Esc = 27,
    Space = 32,
    Left = 37,
    Right = 39,
    ColonFirefox = 59,
    Colon = 186,
}

export default class EmojiPlugin implements EditorPlugin {
    private editor: Editor;
    private contentDiv: HTMLDivElement;
    private isSuggesting: boolean;
    private pane: EmojiPane;
    private eventHandledOnKeyDown: boolean;
    private canUndoEmoji: boolean;
    private timer: number;

    constructor(private strings?: Strings) {}

    initialize(editor: Editor) {
        this.editor = editor;
        let document = this.editor.getDocument();
        this.contentDiv = document.createElement('div');
        document.body.appendChild(this.contentDiv);
    }

    dispose() {
        this.setIsSuggesting(false);
        this.contentDiv.parentElement.removeChild(this.contentDiv);
        this.contentDiv = null;
        this.editor = null;
    }

    willHandleEventExclusively(event: PluginEvent) {
        return (
            this.isSuggesting &&
            (event.eventType == PluginEventType.KeyDown ||
                event.eventType == PluginEventType.KeyUp ||
                event.eventType == PluginEventType.MouseUp)
        );
    }

    onPluginEvent(event: PluginEvent) {
        let domEvent = event as PluginDomEvent;
        let keyboardEvent = domEvent.rawEvent as KeyboardEvent;

        if (event.eventType == PluginEventType.KeyDown) {
            this.eventHandledOnKeyDown = false;
            if (this.isSuggesting) {
                this.onKeyDownSuggestingDomEvent(domEvent);
            } else if (keyboardEvent.which == Key.Backspace && this.canUndoEmoji) {
                // If KeyDown is backspace and canUndoEmoji, call editor undo
                this.editor.undo();
                this.handleEventOnKeyDown(domEvent);
                this.canUndoEmoji = false;
            }
        } else if (
            event.eventType == PluginEventType.KeyUp &&
            !this.isModifierKey(keyboardEvent.key)
        ) {
            if (this.isSuggesting) {
                this.onKeyUpSuggestingDomEvent(domEvent);
            } else {
                this.onKeyUpDomEvent(domEvent);
            }
        } else if (event.eventType == PluginEventType.MouseUp) {
            // If MouseUp, the emoji cannot be undone
            this.canUndoEmoji = false;
            this.setIsSuggesting(false);
        }
    }

    setIsSuggesting(isSuggesting: boolean) {
        if (this.isSuggesting == isSuggesting) {
            return;
        }

        this.isSuggesting = isSuggesting;
        if (this.isSuggesting) {
            ReactDOM.render(this.getCallout(), this.contentDiv);
        } else {
            ReactDOM.unmountComponentAtNode(this.contentDiv);
        }
    }

    /**
     * On KeyDown suggesting DOM event
     * Try to insert emoji is possible
     * Intercept arrow keys to move selection if popup is shown
     */
    private onKeyDownSuggestingDomEvent(event: PluginDomEvent) {
        // If key is enter, try insert emoji at selection
        // If key is space and selection is shortcut, try insert emoji
        let keyboardEvent = event.rawEvent as KeyboardEvent;
        let selectedEmoji = this.pane.getSelectedEmoji();
        let emoji: Emoji;
        let wordBeforeCursor = this.getWordBeforeCursor(event);
        switch (keyboardEvent.which) {
            case Key.Enter:
                if (selectedEmoji && !selectedEmoji.codePoint) {
                    this.handleEventOnKeyDown(event);
                    this.pane.showFullPicker(wordBeforeCursor);
                } else {
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
            case Key.Space:
                // We only want to insert on space if the word before the cursor is a shrotcut
                // If the timer is not null, that means we have a search queued.
                // Check to see is the word before the cursor matches a shortcut first
                // Otherwise if the search completed and it is a shortcut, insert the first item
                if (this.timer) {
                    emoji = matchShortcut(wordBeforeCursor);
                } else {
                    emoji = selectedEmoji;
                }
                break;
            case Key.Left:
            case Key.Right:
                this.pane.navigate(keyboardEvent.which == Key.Left ? -1 : 1);
                this.handleEventOnKeyDown(event);
                break;
            case Key.Esc:
                this.setIsSuggesting(false);
                this.handleEventOnKeyDown(event);
        }

        if (emoji && (this.canUndoEmoji = this.insertEmoji(emoji, wordBeforeCursor))) {
            this.handleEventOnKeyDown(event);
        }
    }

    /**
     * On KeyUp suggesting DOM event
     * If key is character, update search term
     * Otherwise set isSuggesting to false
     */
    private onKeyUpSuggestingDomEvent(event: PluginDomEvent) {
        if (this.eventHandledOnKeyDown) {
            return;
        }

        let keyboardEvent = event.rawEvent as KeyboardEvent;

        // If this is a character key or backspace
        // Clear the timer as we will either queue a new timer or stop suggesting
        if (
            (keyboardEvent.key.length == 1 && keyboardEvent.which != Key.Space) ||
            keyboardEvent.which == Key.Backspace
        ) {
            window.clearTimeout(this.timer);
            this.timer = null;
        }

        let wordBeforeCursor = this.getWordBeforeCursor(event);
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

    private onKeyUpDomEvent(event: PluginDomEvent) {
        if (this.eventHandledOnKeyDown) {
            return;
        }

        let keyboardEvent = event.rawEvent as KeyboardEvent;
        let wordBeforeCursor = this.getWordBeforeCursor(event);
        if (
            (keyboardEvent.which == Key.Colon || keyboardEvent.which == Key.ColonFirefox) &&
            wordBeforeCursor == ':'
        ) {
            this.setIsSuggesting(true);
        } else if (wordBeforeCursor) {
            let cursorData = cacheGetCursorEventData(event, this.editor);
            let charBeforeCursor = cursorData ? cursorData.getXCharsBeforeCursor(1) : null;

            // It is possible that the word before the cursor is ahead of the pluginEvent we are handling
            // ex. WordBeforeCursor is ":D"" but the event we are currently handling is for the : key
            // Check that the char before the cursor is actually the key event we are currently handling
            // Otherwise we set canUndoEmoji to early and user is unable to backspace undo on the inserted emoji
            if (keyboardEvent.key == charBeforeCursor) {
                let emoji = matchShortcut(wordBeforeCursor);
                if (emoji && this.insertEmoji(emoji, wordBeforeCursor)) {
                    clearCursorEventDataCache(event);
                    this.canUndoEmoji = true;
                }
            }
        }
    }

    private insertEmoji(emoji: Emoji, wordBeforeCursor: string) {
        let inserted = false;
        this.editor.addUndoSnapshot();

        let node = this.editor.getDocument().createElement('span');
        node.innerText = emoji.codePoint;
        if (
            wordBeforeCursor &&
            replaceTextBeforeCursorWithNode(
                this.editor,
                wordBeforeCursor,
                node,
                false /*exactMatch*/
            )
        ) {
            inserted = true;
            this.canUndoEmoji = true;

            // Update the editor cursor to be after the inserted node
            window.requestAnimationFrame(() => {
                if (this.editor && this.editor.contains(node)) {
                    let newSelectionRange = this.editor.getDocument().createRange();
                    newSelectionRange.setStartAfter(node);
                    newSelectionRange.collapse(true);
                    this.editor.updateSelection(newSelectionRange);
                    this.editor.addUndoSnapshot();
                }
            });
        } else {
            inserted = this.editor.insertNode(node);
        }

        if (inserted) {
            this.editor.triggerEvent(
                {
                    eventType: PluginEventType.ContentChanged,
                    source: 'Emoji',
                } as PluginEvent,
                true /* broadcast */
            );
        }

        this.tryPatchEmojiFont();
        this.setIsSuggesting(false);

        return inserted;
    }

    private isModifierKey(key: string): boolean {
        return key == 'Shift' || key == 'Control' || key == 'Alt' || key == 'Command';
    }

    private handleEventOnKeyDown(event: PluginDomEvent) {
        this.eventHandledOnKeyDown = true;
        event.rawEvent.preventDefault();
        event.rawEvent.stopImmediatePropagation();
    }

    private getCallout() {
        let cursorRect = this.editor.getCursorRect();
        let point = {
            x: cursorRect.left,
            y: (cursorRect.top + cursorRect.bottom) / 2,
        };
        let gap = (cursorRect.bottom - cursorRect.top) / 2 + 5;
        return (
            <Callout
                targetPoint={point}
                useTargetPoint={true}
                directionalHint={DirectionalHint.bottomLeftEdge}
                isBeakVisible={false}
                gapSpace={gap}
                onDismiss={() => this.setIsSuggesting(false)}>
                <EmojiPane
                    ref={ref => (this.pane = ref)}
                    onSelect={this.onSelectFromPane}
                    strings={this.strings}
                />
            </Callout>
        );
    }

    private tryPatchEmojiFont() {
        // This is not perfect way of doing this, but cannot find a better way.
        // Essentially what is happening is, emoji requires some special font to render properly. Without those font, it may render black and white
        // The fix we have right now is to find the topest block element and patch it with emoji font
        let range = this.editor.getSelectionRange();
        let inlineElement = range ? this.editor.getInlineElementAtNode(range.startContainer) : null;
        let blockElement = inlineElement ? inlineElement.getParentBlock() : null;
        if (blockElement) {
            let blockNode = blockElement.getStartNode() as HTMLElement;
            let fontFamily = blockNode.style.fontFamily;
            if (fontFamily && fontFamily.toLowerCase().indexOf('emoji') < 0) {
                blockNode.style.fontFamily =
                    fontFamily + ',' + INTERNAL_EMOJI_FONT_NAME + ',' + EMOJI_FONT_LIST;
            }
        }
    }

    private getWordBeforeCursor(event: PluginEvent): string {
        let cursorData = cacheGetCursorEventData(event, this.editor);
        let wordBeforeCursor = cursorData ? cursorData.wordBeforeCursor : null;
        let matches = EMOJI_BEFORE_COLON_REGEX.exec(wordBeforeCursor);
        return matches && matches.length > 2 && matches[0] == wordBeforeCursor ? matches[2] : null;
    }

    private onSelectFromPane = (emoji: Emoji, wordBeforeCursor: string) => {
        if (emoji && !emoji.codePoint) {
            this.pane.showFullPicker(wordBeforeCursor);
        } else {
            this.insertEmoji(emoji, wordBeforeCursor);
        }
    };
}
