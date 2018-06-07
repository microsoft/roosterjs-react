import { Editor } from 'roosterjs-editor-core';

import { Base64Svgs } from '../resources/Images';
import * as Styles from '../scss/core.scss.g';
import { css } from '../utils/ReactUtil';

export interface ImageManagerInteface {
    upload: (editor: Editor, image: File) => HTMLElement;
    updatePlaceholders: (html: string) => UpdatePlaceholdersResult;
}

export interface ImageManagerOptions {
    uploadImage: (file: File) => Promise<string>;
    createImagePlaceholder?: (editor: Editor, image: File) => HTMLImageElement;
    placeHolderImageClassName?: string;
}

const PlaceholderDataName = 'paste-image-placeholder-804b751e';
export const PlaceholderDataAttribute = `data-${PlaceholderDataName}`;

export function hasPlaceholder(html: string): boolean {
    return html.indexOf(PlaceholderDataAttribute) > -1; // quick and dirty check
}

export interface UpdatePlaceholdersResult {
    resolvedAll: boolean;
    html: string;
}

export default class ImageManager implements ImageManagerInteface {
    private static Id: number = 0;

    private idToUrlImageCache: { [id: string]: string } = {};
    private options: ImageManagerOptions;

    constructor(options: ImageManagerOptions) {
        this.options = { ...options };
        this.options.createImagePlaceholder = this.options.createImagePlaceholder || this.defaultCreateImagePlaceholder;
    }

    public upload(editor: Editor, image: File): HTMLImageElement {
        if (!image || image.size === 0) {
            return null;
        }

        const placeholder = this.options.createImagePlaceholder(editor, image);
        if (placeholder === null) {
            return null;
        }

        // note: add identification (to handle undo/redo scenarios)
        const placeholdId = (ImageManager.Id++).toString(10);
        placeholder.setAttribute(PlaceholderDataAttribute, placeholdId);

        this.options.uploadImage(image).then(
            (url: string) => {
                // accepted, so replace the placeholder with final image
                this.idToUrlImageCache[placeholdId] = url;

                if (editor.isDisposed() || !editor.contains(placeholder)) {
                    return;
                }

                this.replacePlaceholder(placeholder, url, editor);
                this.triggerChangeEvent(editor);
            },
            () => {
                // rejected, so remove the placeholder
                if (editor.isDisposed() || !editor.contains(placeholder)) {
                    return;
                }

                this.idToUrlImageCache[placeholdId] = null;
                this.removePlaceholder(placeholder, editor);
                this.triggerChangeEvent(editor);
            }
        );

        return placeholder;
    }

    public updatePlaceholders(html: string): UpdatePlaceholdersResult {
        // example: <TAG data-paste-image-placeholder-804b751e="10" />
        const container = document.createElement('div');
        container.innerHTML = html;
        const placeholders = container.querySelectorAll(`[${PlaceholderDataAttribute}]`);
        let resolvedAll = true;
        for (let i = 0; i < placeholders.length; ++i) {
            const placeholder = placeholders[i];
            const id = placeholder.getAttribute(PlaceholderDataAttribute);
            const url = this.idToUrlImageCache[id];
            if (url === undefined) {
                resolvedAll = false;
                continue;
            }

            if (url === null) {
                this.removePlaceholder(placeholder as HTMLElement);
            } else {
                this.replacePlaceholder(placeholder as HTMLElement, url);
            }
        }

        return { html: container.innerHTML, resolvedAll };
    }

    private triggerChangeEvent(editor: Editor): void {
        editor.triggerContentChangedEvent('ImageManager');
    }

    private removePlaceholder(placeholder: HTMLElement, editor?: Editor): void {
        if (editor) {
            editor.deleteNode(placeholder);
            editor.addUndoSnapshot();
        } else {
            const parent = placeholder.parentNode;
            if (parent) {
                parent.removeChild(placeholder);
            }
        }
    }

    private replacePlaceholder(placeholder: HTMLElement, url: string, editor?: Editor): void {
        // just update attributes if placeholder is already an image tag
        if (placeholder.tagName === 'IMG') {
            const img = placeholder as HTMLImageElement;
            img.src = url;
            img.classList.remove(Styles.roosterjsReactSpinner, this.options.placeHolderImageClassName);
            placeholder.removeAttribute(PlaceholderDataAttribute);
        } else {
            const doc = editor ? editor.getDocument() : document; // editor can be null when called from updatePlaceholders

            // create final IMG node
            const img = doc.createElement('img') as HTMLImageElement;
            img.src = url;
            if (editor) {
                editor.replaceNode(placeholder, img);
                editor.addUndoSnapshot();
            } else {
                doc.replaceChild(img, placeholder);
            }
        }
    }

    private defaultCreateImagePlaceholder = (editor: Editor, image: File): HTMLImageElement => {
        if (editor.isDisposed()) {
            return null;
        }

        const result = editor.getDocument().createElement('img') as HTMLImageElement;
        result.src = Base64Svgs.RoosterJsReactSpinner;
        result.className = css(Styles.roosterjsReactSpinner, this.options.placeHolderImageClassName);

        return result;
    };
}
