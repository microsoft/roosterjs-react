import { Editor, EditorPlugin } from "roosterjs-editor-core";
import { PluginEvent, PluginEventType } from "roosterjs-editor-types";

export default class ContentChangedPlugin implements EditorPlugin {
    private changeDisposer: () => void;
    private textInputDisposer: () => void;
    private pasteDisposer: () => void;

    protected editor: Editor;

    public constructor(private onChange: (newValue: string) => void) {}

    public initialize(editor: Editor): void {
        this.editor = editor;
        this.changeDisposer = this.editor.addDomEventHandler("input", this.onChangeEvent);
        this.textInputDisposer = this.editor.addDomEventHandler("textinput", this.onChangeEvent); // IE 11
        this.pasteDisposer = this.editor.addDomEventHandler("paste", this.onChangeEvent);
    }

    public onPluginEvent(event: PluginEvent): void {
        if (event && event.eventType === PluginEventType.ContentChanged) {
            this.onChangeEvent();
        }
    }

    public dispose(): void {
        if (this.changeDisposer) {
            this.changeDisposer();
            this.changeDisposer = null;
        }
        if (this.textInputDisposer) {
            this.textInputDisposer();
            this.textInputDisposer = null;
        }
        if (this.pasteDisposer) {
            this.pasteDisposer();
            this.pasteDisposer = null;
        }

        this.editor = null;
    }

    private onChangeEvent = (): void => {
        this.onChange(this.editor.getContent());
    };
}
