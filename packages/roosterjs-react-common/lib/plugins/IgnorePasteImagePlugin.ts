import { Editor, EditorPlugin } from "roosterjs-editor-core";
import { BeforePasteEvent, PasteOption, PluginEvent, PluginEventType } from "roosterjs-editor-types";

export default class IgnorePasteImagePlugin implements EditorPlugin {
    private editor: Editor;
    private static InternalInstance = new IgnorePasteImagePlugin();

    private constructor() {}

    public static get Instance(): IgnorePasteImagePlugin {
        return IgnorePasteImagePlugin.InternalInstance;
    }

    public initialize(editor: Editor): void {
        this.editor = editor;
    }

    public dispose(): void {
        if (this.editor) {
            this.editor = null;
        }
    }

    public onPluginEvent(event: PluginEvent): void {
        if (event.eventType !== PluginEventType.BeforePaste) {
            return;
        }
        const beforePasteEvent = event as BeforePasteEvent;
        if (beforePasteEvent.pasteOption !== PasteOption.PasteImage) {
            return;
        }

        // handle only before paste and image paste
        const editor = this.getEditor();
        if (!editor) {
            return;
        }

        // prevent pasting of image by telling the handler to interpret the paste as text
        beforePasteEvent.pasteOption = PasteOption.PasteText;
    }

    public getEditor(): Editor {
        return this.editor;
    }
}
