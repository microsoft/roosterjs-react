import { Editor, EditorPlugin } from 'roosterjs-editor-core';
import { PluginEvent, PluginEventType, PasteOption, BeforePasteEvent } from 'roosterjs-editor-types';
import { ImageManagerInteface } from '../utils/ImageManager';

export default class PasteImagePlugin implements EditorPlugin {
    private editor: Editor;

    constructor(private imageManager: ImageManagerInteface) { }

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
        const image = beforePasteEvent.clipboardData.image;
        const editor = this.getEditor();
        if (!editor) {
            return;
        }

        const placeholder: HTMLElement = this.imageManager.upload(editor, image);
        if (placeholder === null) {
            return;
        }

        // modify the pasting content and option so Paste plugin won't handle
        beforePasteEvent.fragment.appendChild(placeholder);
        beforePasteEvent.clipboardData.html = placeholder.outerHTML;
        beforePasteEvent.pasteOption = PasteOption.PasteHtml;
    }

    public getEditor(): Editor {
        return this.editor;
    }
}
