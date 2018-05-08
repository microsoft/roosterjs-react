import { css } from '../utils/ReactUtil';
import { Base64Svgs } from '../resources/Images';
import { Editor } from 'roosterjs-editor-core';

import * as Styles from '../scss/core.scss.g';

export interface ImageManagerInteface {
    upload: (editor: Editor, image: File) => HTMLElement;
    updatePlaceholders: (html: string) => UpdatePlaceholdersResult;
}

export interface ImageManagerOptions {
    uploadImage: (file: File) => Promise<string>;
    createImagePlaceholder?: (editor: Editor, image: File) => HTMLElement;
    placeHolderImageClassName?: string;
}

const PlaceholderDataName = "paste-image-placeholder-804b751e";
const PlaceholderDataAttribute = `data-${PlaceholderDataName}`;

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

    public upload(editor: Editor, image: File): HTMLElement {
        const placeholder = this.options.createImagePlaceholder(editor, image);
        if (placeholder === null) {
            return null;
        }

        // note: add identification (to handle undo/redo scenarios)
        const placeholdId = (ImageManager.Id++).toString(10);
        placeholder.setAttribute(PlaceholderDataAttribute, placeholdId);

        this.options.uploadImage(image).then((url: string) => {
            this.idToUrlImageCache[placeholdId] = url;

            if (editor.isDisposed()) {
                return;
            }

            this.replacePlaceholder(placeholder, url, editor);
        });

        return placeholder;
    }
    public updatePlaceholders(html: string): UpdatePlaceholdersResult {
        // example: <TAG data-paste-image-placeholder-804b751e="10" />
        const container = document.createElement("div");
        container.innerHTML = html;
        const placeholders = container.querySelectorAll(`[${PlaceholderDataAttribute}]`);
        let resolvedAll = true;
        for (let i = 0; i < placeholders.length; ++i) {
            const placeholder = placeholders[i];
            const id = placeholder.getAttribute(PlaceholderDataAttribute);
            const url = this.idToUrlImageCache[id];
            if (!url) {
                resolvedAll = false;
                continue;
            }

            this.replacePlaceholder(placeholder as HTMLElement, url);
        }

        return { html: container.innerHTML, resolvedAll };
    }

    private replacePlaceholder(placeholder: HTMLElement, url: string, editor?: Editor) {
        // just update attributes if placeholder is already an image tag
        if (placeholder.tagName === "IMG") {
            const img = placeholder as HTMLImageElement;
            img.src = url;
            img.classList.remove(Styles.roosterjsReactSpinner, this.options.placeHolderImageClassName);
            placeholder.removeAttribute(PlaceholderDataAttribute);
        } else {
            const doc = editor ? editor.getDocument() : document;

            // create final IMG node
            const img = doc.createElement("img") as HTMLImageElement;
            img.src = url;
            if (editor) {
                editor.replaceNode(placeholder, img);
                editor.addUndoSnapshot();
            } else {
                doc.replaceChild(img, placeholder);
            }
        }
    }

    private defaultCreateImagePlaceholder = (editor: Editor, image: File): HTMLElement => {
        if (editor.isDisposed()) {
            return null;
        }

        const result = editor.getDocument().createElement("img") as HTMLImageElement;
        result.src = Base64Svgs.RoosterJsReactSpinner;
        result.className = css(Styles.roosterjsReactSpinner, this.options.placeHolderImageClassName);

        return result;
    };
}
