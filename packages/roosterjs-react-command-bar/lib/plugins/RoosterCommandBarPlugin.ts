import { Editor, EditorPlugin, browserData } from 'roosterjs-editor-core';
import { PluginEvent, PluginEventType, PluginDomEvent } from 'roosterjs-editor-types';
import { DefaultShortcut } from 'roosterjs-editor-plugins';
import { KeyCodes } from 'office-ui-fabric-react/lib/Utilities';
import { createLinkWithPrompt } from 'roosterjs-react-common';

import RoosterCommandBar from '../components/RoosterCommandBar';
import RoosterCommandBarPluginInterface from '../schema/RoosterCommandBarPluginInterface';

export default class RoosterCommandBarPlugin implements EditorPlugin, RoosterCommandBarPluginInterface {
    private static readonly EventTypesToHandle: { [eventType: number]: boolean } = {
        [PluginEventType.KeyUp]: true,
        [PluginEventType.MouseDown]: true,
        [PluginEventType.MouseUp]: true,
        [PluginEventType.ContentChanged]: true
    };

    private editor: Editor;
    private commandBars: RoosterCommandBar[] = [];
    private defaultShortcut: DefaultShortcut = new DefaultShortcut();
    private strings: { [key: string]: string };

    constructor(strings?: { [key: string]: string }) {
        this.strings = strings;
    }

    public initialize(editor: Editor): void {
        this.defaultShortcut.initialize(editor);
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

        if (this.defaultShortcut) {
            this.defaultShortcut.dispose();
            this.defaultShortcut = null;
        }
    }

    public onPluginEvent(event: PluginEvent): void {
        if (this.commandBars && RoosterCommandBarPlugin.EventTypesToHandle[event.eventType]) {
            this.commandBars.forEach(commandBar => commandBar.refreshFormatState());
            return;
        }

        if (event.eventType === PluginEventType.KeyDown) {
            this.handleShortcuts(event);
        }
    }

    private handleShortcuts(event: PluginEvent) {
        const keyboardEvent = (event as PluginDomEvent).rawEvent as KeyboardEvent;
        if (keyboardEvent.defaultPrevented) {
            return;
        }

        const isCommand = browserData.isMac ? keyboardEvent.metaKey : keyboardEvent.ctrlKey;
        if (isCommand && keyboardEvent.which === KeyCodes.k && this.commandBars) {
            createLinkWithPrompt(this.editor, this.strings);
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
