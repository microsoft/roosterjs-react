import { Editor, EditorPlugin } from 'roosterjs-editor-core';
import { BeforePasteEvent, ExtractContentEvent, PasteOption, PluginEvent, PluginEventType } from 'roosterjs-editor-types';

import { hasPlaceholder, ImageManagerInteface, PlaceholderDataAttribute } from '../utils/ImageManager';

const PlaceholderRegex = new RegExp(`<img [^>]*${PlaceholderDataAttribute}="\\d+"[^>]*>`, 'gm');

export default class PasteImagePlugin implements EditorPlugin {
    private editor: Editor;

    constructor(private imageManager: ImageManagerInteface) {}

    public initialize(editor: Editor): void {
        this.editor = editor;
    }

    public dispose(): void {
        if (this.editor) {
            this.editor = null;
        }
    }

    public onPluginEvent(event: PluginEvent): void {
        if (event.eventType === PluginEventType.ExtractContent) {
            const extractContentEvent = event as ExtractContentEvent;
            const content = extractContentEvent.content;
            const runRemove = hasPlaceholder(content);
            if (runRemove) {
                extractContentEvent.content = content.replace(PlaceholderRegex, '');
            }

            return;
        }

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
