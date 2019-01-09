import RibbonComponent from '../schema/RibbonComponent';
import { Editor, EditorPlugin } from 'roosterjs-editor-core';
import { PluginEvent, PluginEventType } from 'roosterjs-editor-types';

export default class RibbonPlugin implements EditorPlugin {
    private editor: Editor;
    private ribbons: RibbonComponent[] = [];

    constructor(private onButtonClick?: (buttonName: string) => void) {}

    public getName() {
        return 'Ribbon';
    }

    public initialize(editor: Editor): void {
        this.editor = editor;
    }

    public dispose(): void {
        this.editor = null;
    }

    public onPluginEvent(event: PluginEvent): void {
        if (
            event.eventType == PluginEventType.KeyUp ||
            event.eventType == PluginEventType.MouseUp ||
            event.eventType == PluginEventType.ContentChanged
        ) {
            this.ribbons.forEach(ribbon => ribbon.onFormatChange());
        }
    }

    public getEditor(): Editor {
        return this.editor;
    }

    public buttonClick(buttonName: string) {
        if (this.onButtonClick) {
            this.onButtonClick(buttonName);
        }
    }

    public registerRibbonComponent(ribbon: RibbonComponent) {
        if (this.ribbons.indexOf(ribbon) < 0) {
            this.ribbons.push(ribbon);
        }
    }

    public unregisterRibbonComponent(ribbon: RibbonComponent) {
        let index = this.ribbons.indexOf(ribbon);
        if (index >= 0) {
            this.ribbons.splice(index, 1);
        }
    }

    public resize() {
        this.ribbons.forEach(ribbon => ribbon.onResize());
    }
}
