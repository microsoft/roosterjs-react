import { Editor, EditorPlugin } from 'roosterjs-editor-core';
import { getTagOfNode } from 'roosterjs-editor-dom';

export default class DoubleClickImagePlugin implements EditorPlugin {
    private onDoubleClickDisposer: () => void;
    private editor: Editor;

    public constructor(private doubleClickImageSelector: string = 'img') {}

    public initialize(editor: Editor): void {
        this.editor = editor;
        this.onDoubleClickDisposer = this.editor.addDomEventHandler('dblclick', this.onDoubleClick);
    }

    public dispose(): void {
        if (this.editor) {
            this.editor = null;
            this.onDoubleClickDisposer();
        }
    }

    public getEditor(): Editor {
        return this.editor;
    }

    private onDoubleClick = (ev: MouseEvent): void => {
        const target = ev.target as HTMLElement;
        if (getTagOfNode(target) !== 'IMG') {
            return;
        }

        const src = target.getAttribute('src');
        if (!src) {
            return;
        }

        const parent = target.parentNode as HTMLElement;
        const elements = parent ? ([].slice.call(parent.querySelectorAll(this.doubleClickImageSelector)) as HTMLElement[]) : [];
        if (elements.indexOf(target) < 0) {
            return;
        }

        const isDataUrl = src.indexOf('data:') === 0;
        const openedWindow = window.open(isDataUrl ? null : src, '_blank');
        if (openedWindow) {
            // noopener
            openedWindow.opener = null;
            if (isDataUrl) {
                openedWindow.document.body.innerHTML = `<img src="${src}">`;
            }
        }
    };
}
