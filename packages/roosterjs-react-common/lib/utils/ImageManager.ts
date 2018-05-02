import { css } from '../utils/ReactUtil';
import { Base64Svgs } from '../resources/Images';
import { Editor } from 'roosterjs-editor-core';
import * as Styles from '../scss/core.scss.g';

export interface ImageManagerInteface {
    upload: (editor: Editor, image: File) => HTMLElement;
}

export interface ImageManagerOptions {
    uploadImage: (dataUrl: string) => Promise<string>;
    createImagePlaceholder?: (editor: Editor, image: File) => HTMLElement;
    placeHolderImageClassName?: string;
}

export default class ImageManager implements ImageManagerInteface {
    private static Id: number = 0;

    private options: ImageManagerOptions;

    constructor(options: ImageManagerOptions) {
        this.options = { ...options };
        this.options.createImagePlaceholder = this.options.createImagePlaceholder || this.defaultCreateImagePlaceholder;
    }

    public upload(editor: Editor, image: File): HTMLElement {
        const placeholder = this.options.createImagePlaceholder(editor, image);
        if (placeholder === null) {
            return null;
        }

        // note: add ID for debug/identification (possibly handle undo/redo scenarios later)
        let preserveId = true;
        if (!placeholder.id) {
            preserveId = false;
            placeholder.id = `paste-image-placeholder-${ImageManager.Id++}`;
        }

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
                    editor.replaceNode(placeholder, img);
                }
            });
        };
        reader.readAsDataURL(image);

        return placeholder;
    }

    private defaultCreateImagePlaceholder = (editor: Editor, image: File): HTMLElement => {
        if (editor.isDisposed()) {
            return null;
        }

        const result = editor.getDocument().createElement("img") as HTMLImageElement;
        result.src = Base64Svgs.RoosterJsReactSpinner;
        result.className = css(Styles.roosterjsReactSpinner, this.options.placeHolderImageClassName);

        return result;
    }
}
