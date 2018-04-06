import { Editor, EditorPlugin } from 'roosterjs-editor-core';
import { PluginEvent, PluginEventType } from 'roosterjs-editor-types';

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

    public initialize(editor: Editor): void {
        this.editor = editor;
    }

    public dispose(): void {
        if (this.editor) {
            this.editor = null;
        }
        if (this.commandBars.length > 0) {
            this.commandBars.forEach((_, i) => this.commandBars[i] = undefined);
            this.commandBars = [];
        }
    }

    public onPluginEvent(event: PluginEvent): void {
        if (this.commandBars && RoosterCommandBarPlugin.EventTypesToHandle[event.eventType]) {
            this.commandBars.forEach(commandBar => commandBar.refreshFormatState());
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
