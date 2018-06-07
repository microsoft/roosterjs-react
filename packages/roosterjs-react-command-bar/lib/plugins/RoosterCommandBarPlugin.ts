import { toggleBold, toggleBullet, toggleItalic, toggleNumbering, toggleUnderline } from 'roosterjs-editor-api';
import { Editor, EditorPlugin } from 'roosterjs-editor-core';
import { PluginDomEvent, PluginEvent, PluginEventType } from 'roosterjs-editor-types';
import { createLinkWithPrompt, NullFunction, Strings } from 'roosterjs-react-common';

import RoosterCommandBar from '../components/RoosterCommandBar';
import RoosterCommandBarPluginInterface from '../schema/RoosterCommandBarPluginInterface';
import { getCommandFromEvent, RoosterShortcutCommands } from './RoosterCommandBarPlugin.Shortcuts';

export default class RoosterCommandBarPlugin implements EditorPlugin, RoosterCommandBarPluginInterface {
    private static readonly EventTypesToRefreshFormatState: { [eventType: number]: boolean } = {
        [PluginEventType.KeyUp]: true,
        [PluginEventType.MouseDown]: true,
        [PluginEventType.MouseUp]: true,
        [PluginEventType.ContentChanged]: true
    };

    private editor: Editor;
    private commandBars: RoosterCommandBar[] = [];
    private strings: Strings;

    constructor(strings?: Strings, private onShortcutTriggered: (command: RoosterShortcutCommands) => void = NullFunction) {
        this.strings = strings;
    }

    public initialize(editor: Editor): void {
        this.editor = editor;
    }

    public dispose(): void {
        if (this.editor) {
            this.editor = null;
        }

        if (this.commandBars.length > 0) {
            this.commandBars.forEach((_, i) => (this.commandBars[i] = undefined));
            this.commandBars = [];
        }
    }

    public onPluginEvent(event: PluginEvent): void {
        if (this.commandBars && RoosterCommandBarPlugin.EventTypesToRefreshFormatState[event.eventType]) {
            this.commandBars.forEach(commandBar => commandBar.refreshFormatState());
            return;
        }

        if (event.eventType === PluginEventType.KeyDown) {
            this.handleShortcuts(event);
        }
    }

    private handleShortcuts(event: PluginEvent) {
        const pluginDomEvent = event as PluginDomEvent;
        const keyboardEvent = pluginDomEvent.rawEvent as KeyboardEvent;
        if (keyboardEvent.defaultPrevented) {
            return;
        }

        const command = getCommandFromEvent(event);
        if (command === RoosterShortcutCommands.None) {
            return;
        }

        const editor = this.editor;
        let commandExecuted = true;
        switch (command) {
            case RoosterShortcutCommands.Bold:
                toggleBold(editor);
                break;
            case RoosterShortcutCommands.Italic:
                toggleItalic(editor);
                break;
            case RoosterShortcutCommands.Underline:
                toggleUnderline(editor);
                break;
            case RoosterShortcutCommands.Undo:
                editor.undo();
                break;
            case RoosterShortcutCommands.Redo:
                editor.redo();
                break;
            case RoosterShortcutCommands.Bullet:
                toggleBullet(editor);
                break;
            case RoosterShortcutCommands.Numbering:
                toggleNumbering(editor);
                break;
            case RoosterShortcutCommands.InsertLink:
                createLinkWithPrompt(editor, this.strings);
                break;
            default:
                commandExecuted = false;
        }

        if (commandExecuted) {
            this.onShortcutTriggered(command);
            keyboardEvent.preventDefault();
            keyboardEvent.stopPropagation();
        }
    }

    public getEditor(): Editor {
        return this.editor;
    }

    public registerRoosterCommandBar(commandBar: RoosterCommandBar): void {
        if (this.commandBars.indexOf(commandBar) < 0) {
            this.commandBars.push(commandBar);
        }
    }

    public unregisterRoosterCommandBar(commandBar: RoosterCommandBar): void {
        const index = this.commandBars.indexOf(commandBar);
        if (index >= 0) {
            this.commandBars.splice(index, 1);
        }
    }
}
