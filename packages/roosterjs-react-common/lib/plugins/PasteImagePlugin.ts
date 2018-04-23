import { Editor, EditorPlugin, } from 'roosterjs-editor-core';
import { PluginEvent, PluginEventType, PasteOption, BeforePasteEvent } from 'roosterjs-editor-types';
import { css } from '../utils/ReactUtil';
import * as Styles from '../scss/core.scss.g';

export interface PasteImagePluginOptions {
    uploadImage: (dataUrl: string) => Promise<string>;
    createImagePlaceholder?: (image: File) => HTMLElement;
    placeHolderImageClassName?: string;
}

export default class PasteImagePlugin implements EditorPlugin {
    private static Id: number = 0;

    private editor: Editor;
    private options: PasteImagePluginOptions;

    constructor(options: PasteImagePluginOptions) {
        this.options = { ...options };
        this.options.createImagePlaceholder = this.options.createImagePlaceholder || this.defaultCreateImagePlaceholder;
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
        const image = beforePasteEvent.clipboardData.image;
        const placeholder = this.options.createImagePlaceholder(image);
        // note: add ID for debug/identification (possibly handle undo/redo scenarios later)
        let preserveId = true;
        if (!placeholder.id) {
            preserveId = false;
            placeholder.id = `paste-image-placeholder-${PasteImagePlugin.Id++}`;
        }

        // modify the pasting content and option so Paste plugin won't handle
        beforePasteEvent.fragment.appendChild(placeholder);
        beforePasteEvent.clipboardData.html = placeholder.outerHTML;
        beforePasteEvent.pasteOption = PasteOption.PasteHtml;

        const editor = this.editor;
        let reader = new FileReader();
        reader.onload = (event: ProgressEvent) => {
            if (editor.isDisposed()) {
                return;
            }

            const dataURL: string = (event.target as FileReader).result;
            this.options.uploadImage(dataURL).then((url: string) => {
                if (editor.isDisposed()) {
                    return;
                }

                // just update attributes if placeholder is already an image tag
                if (placeholder.tagName === "IMG") {
                    const img = placeholder as HTMLImageElement;
                    img.src = url;
                    img.classList.remove(Styles.roosterjsReactSpinner, this.options.placeHolderImageClassName);
                    if (!preserveId) {
                        img.id = "";
                    }
                } else {
                    // create final IMG node
                    const img = editor.getDocument().createElement("img") as HTMLImageElement;
                    img.src = url;
                    this.editor.replaceNode(placeholder, img);
                }
            });
        };
        reader.readAsDataURL(image);
    }

    public getEditor(): Editor {
        return this.editor;
    }

    private defaultCreateImagePlaceholder = (image: File): HTMLElement => {
        const result = this.editor.getDocument().createElement("img") as HTMLImageElement;
        // Note: just a simple SVG spinner (based on Office Fabric Spinner), decode Base64 to see the code
        result.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2IoMCwgMTIwLCAyMTIpIiBzdHJva2Utd2lkdGg9IjEuNSIgZD0iTSAxNC41IDggQSA2LjUgNi41IDAgMCAwIDggMS41IiBzaGFwZS1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgLz48cGF0aCBmaWxsPSJub25lIiBzdHJva2U9InJnYigxOTksIDIyNCwgMjQ0KSIgc3Ryb2tlLXdpZHRoPSIxLjUiIGQ9Ik0gNy45OTk5OTk5OTk5OTk5OTkgMS41IEEgNi41IDYuNSAwIDEgMCAxNC41IDgiIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiAvPjwvc3ZnPg=="
        result.className = css(Styles.roosterjsReactSpinner, this.options.placeHolderImageClassName);

        return result;
    }
}
